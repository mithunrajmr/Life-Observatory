import { 
  DomainId, 
  DomainState, 
  DomainTrajectoryPoint, 
  LifeEvent, 
  LifeSnapshot, 
  TrendDirection, 
  ConfidenceLevel, 
  DEFAULT_DOMAINS, 
  TurningPoint,
  Goal
} from '../types';
import { getUserSubcollection } from './firebaseAdmin';

/**
 * Life Model Engine (Layer B):
 * Deterministic aggregation, time-series calculation, and trajectory generation.
 * Follows the Master Spec directive: Gemini is NOT used for arithmetic or coordinate calculation.
 */
export async function computeLifeHorizon(
  uid: string,
  timeframeWeeks: number = 12
): Promise<LifeSnapshot> {
  const eventsCollection = getUserSubcollection(uid, 'events');
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - timeframeWeeks * 7 * 24 * 60 * 60 * 1000);

  // Fetch events for user
  const eventsSnapshot = await eventsCollection.get();
  const allEvents: LifeEvent[] = [];
  eventsSnapshot.forEach(doc => {
    const data = doc.data() as LifeEvent;
    allEvents.push(data);
  });

  // Filter and sort chronologically
  const recentEvents = allEvents
    .filter(e => new Date(e.occurredAt) >= cutoffDate)
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  // Domain states map
  const domainStates: Record<DomainId, DomainState> = {} as any;
  const domainKeys = Object.keys(DEFAULT_DOMAINS) as DomainId[];

  // Generate weekly intervals
  const weekBuckets: Array<{ start: Date; end: Date; label: string }> = [];
  for (let i = timeframeWeeks - 1; i >= 0; i--) {
    const start = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    weekBuckets.push({
      start,
      end,
      label: end.toISOString().split('T')[0],
    });
  }

  // Calculate trajectories for each domain
  for (const domainId of domainKeys) {
    const domainEvents = recentEvents.filter(e => e.domainIds.includes(domainId));
    const trajectoryPoints: DomainTrajectoryPoint[] = [];

    let rollingScore = 0.0;
    for (const bucket of weekBuckets) {
      const bucketEvents = domainEvents.filter(e => {
        const d = new Date(e.occurredAt);
        return d >= bucket.start && d < bucket.end;
      });

      // Deterministic impact calculation
      let weeklyDelta = 0.0;
      for (const ev of bucketEvents) {
        const sentimentWeight = 
          ev.sentiment === 'positive' ? 0.35 :
          ev.sentiment === 'negative' ? -0.35 :
          ev.sentiment === 'mixed' ? 0.05 : 0.1;

        const intensityWeight = (ev.intensity || 2) * 0.2;
        const confidenceWeight = ev.confidence || 0.8;

        weeklyDelta += sentimentWeight * intensityWeight * confidenceWeight;
      }

      // Smooth decay factor towards baseline (mean reversion)
      rollingScore = rollingScore * 0.7 + weeklyDelta;
      // Clamp between -1.0 and 1.0
      rollingScore = Math.max(-1.0, Math.min(1.0, rollingScore));

      trajectoryPoints.push({
        date: bucket.label,
        value: parseFloat(rollingScore.toFixed(3)),
        eventCount: bucketEvents.length,
      });
    }

    // Determine direction and confidence category
    const eventCount = domainEvents.length;
    let confidence: ConfidenceLevel = 'insufficient_evidence';
    let direction: TrendDirection = 'insufficient_evidence';
    let summary = 'Not enough recorded activity yet.';

    if (eventCount === 0) {
      confidence = 'insufficient_evidence';
      direction = 'insufficient_evidence';
    } else if (eventCount < 3) {
      confidence = 'low';
      if (rollingScore < -0.15) {
        direction = 'down';
        summary = 'Early downward pressure or setbacks observed.';
      } else if (rollingScore > 0.15) {
        direction = 'emerging';
        summary = 'Early positive signals beginning to emerge.';
      } else {
        direction = 'emerging';
        summary = 'Initial signals beginning to emerge.';
      }
    } else {
      confidence = eventCount >= 7 ? 'high' : 'medium';
      
      const lastThree = trajectoryPoints.slice(-3);
      const prevThree = trajectoryPoints.slice(-6, -3);

      const recentAvg = lastThree.reduce((sum, p) => sum + p.value, 0) / (lastThree.length || 1);
      const priorAvg = prevThree.length > 0 
        ? prevThree.reduce((sum, p) => sum + p.value, 0) / prevThree.length 
        : 0;

      const delta = recentAvg - priorAvg;

      if (recentAvg > 0.15) {
        direction = (recentAvg > 0.35 || priorAvg > 0.2) ? 'sustained_up' : 'up';
        summary = 'Positive momentum sustained across recent weeks.';
      } else if (recentAvg < -0.15) {
        direction = (recentAvg < -0.35 || priorAvg < -0.2) ? 'sustained_down' : 'down';
        summary = 'Noticeable downward pressure or setbacks observed.';
      } else if (Math.abs(delta) <= 0.15 && Math.abs(recentAvg) <= 0.15) {
        direction = 'stable';
        summary = 'Consistent and stable trajectory.';
      } else {
        direction = 'mixed';
        summary = 'Mixed signals with fluctuating activity.';
      }
    }

    domainStates[domainId] = {
      domainId,
      direction,
      trendScore: parseFloat(rollingScore.toFixed(3)),
      eventCount,
      confidence,
      points: trajectoryPoints,
      summary,
    };
  }

  // Turning Point detection
  const turningPoints = await detectTurningPoints(uid, allEvents);

  const snapshot: LifeSnapshot = {
    id: `snap_${Date.now()}`,
    userId: uid,
    period: {
      from: cutoffDate.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0],
    },
    domainStates,
    turningPoints,
    insights: [], // populated by Insight Engine
    createdAt: new Date().toISOString(),
  };

  // Persist snapshot in Firestore
  const snapshotsCol = getUserSubcollection(uid, 'snapshots');
  await snapshotsCol.doc('latest').set(snapshot);

  return snapshot;
}

/**
 * Detects Turning Points deterministically based on high-intensity events
 * or trajectory divergence marked by candidate flags.
 */
export async function detectTurningPoints(
  uid: string,
  events: LifeEvent[]
): Promise<TurningPoint[]> {
  const turningPointsCol = getUserSubcollection(uid, 'turningPoints');
  const existingDocs = await turningPointsCol.get();

  const existingMap = new Map<string, TurningPoint>();
  existingDocs.forEach(d => {
    const tp = d.data() as TurningPoint;
    existingMap.set(tp.eventId, tp);
  });

  const turningPoints: TurningPoint[] = [];

  for (const ev of events) {
    if (ev.isTurningPointCandidate || (ev.intensity >= 4 && (ev.type === 'milestone' || ev.type === 'achievement' || ev.type === 'setback'))) {
      if (existingMap.has(ev.id)) {
        turningPoints.push(existingMap.get(ev.id)!);
      } else {
        const tpRef = turningPointsCol.doc();
        const newTp: TurningPoint = {
          id: tpRef.id,
          userId: uid,
          eventId: ev.id,
          title: ev.title,
          description: ev.summary,
          occurredAt: ev.occurredAt,
          status: 'candidate',
          trajectoryShiftSummary: `Meaningful inflection point observed in ${ev.domainIds.join(', ')}.`,
          evidenceRefs: [ev.source.ref || ev.id],
          domains: ev.domainIds,
        };
        await tpRef.set(newTp);
        turningPoints.push(newTp);
      }
    }
  }

  return turningPoints.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

/**
 * Evaluates Goal Drift by comparing active user goals with recent domain activity.
 */
export async function evaluateGoalDrift(uid: string): Promise<Array<{ goal: Goal; driftDetected: boolean; reason: string }>> {
  const goalsCol = getUserSubcollection(uid, 'goals');
  const goalsSnap = await goalsCol.where('status', '==', 'active').get();

  if (goalsSnap.empty) return [];

  const eventsCol = getUserSubcollection(uid, 'events');
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const eventsSnap = await eventsCol.get();

  const domainActivityCount: Record<string, number> = {};
  eventsSnap.forEach(d => {
    const ev = d.data() as LifeEvent;
    if (new Date(ev.occurredAt) >= fourWeeksAgo) {
      for (const dom of ev.domainIds) {
        domainActivityCount[dom] = (domainActivityCount[dom] || 0) + 1;
      }
    }
  });

  const results: Array<{ goal: Goal; driftDetected: boolean; reason: string }> = [];

  goalsSnap.forEach(d => {
    const goal = d.data() as Goal;
    const count = domainActivityCount[goal.domainId] || 0;
    if (count === 0) {
      results.push({
        goal,
        driftDetected: true,
        reason: `Goal '${goal.title}' in ${goal.domainId} is active, but no related activity has been logged in the past 4 weeks.`,
      });
    } else {
      results.push({
        goal,
        driftDetected: false,
        reason: `${count} events recorded in ${goal.domainId} recently.`,
      });
    }
  });

  return results;
}
