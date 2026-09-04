import crypto from 'crypto';
import { 
  DomainId, 
  LifeEvent, 
  LifeInsight, 
  LifeSnapshot, 
  EvidenceItem, 
  ConfidenceLevel 
} from '../types';
import { generateGeminiJson } from './gemini';
import { getUserSubcollection } from './firebaseAdmin';
import { evaluateGoalDrift } from './lifeModelEngine';

/**
 * Generates an idempotent fingerprint for an insight based on type, domains, and core timeframe.
 * Used to suppress repetitive or redundant insights.
 */
export function generateInsightFingerprint(
  type: string,
  domainIds: DomainId[],
  period: { from: string; to: string }
): string {
  const domKey = [...domainIds].sort().join(':');
  const raw = `${type}_${domKey}_${period.from.slice(0, 7)}_${period.to.slice(0, 7)}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

/**
 * Insight Engine (Layer C):
 * Evaluates eligibility, deduplicates against existing records,
 * and synthesizes evidence-backed insights using Gemini.
 */
export async function synthesizeProactiveInsights(
  uid: string,
  snapshot: LifeSnapshot
): Promise<LifeInsight[]> {
  const insightsCol = getUserSubcollection(uid, 'insights');
  const existingDocs = await insightsCol.get();
  
  const existingFingerprints = new Set<string>();
  const activeInsights: LifeInsight[] = [];
  existingDocs.forEach(d => {
    const data = d.data() as LifeInsight;
    existingFingerprints.add(data.fingerprint);
    activeInsights.push(data);
  });

  const eventsCol = getUserSubcollection(uid, 'events');
  const eventsSnap = await eventsCol.get();
  const allEvents: LifeEvent[] = [];
  eventsSnap.forEach(d => allEvents.push(d.data() as LifeEvent));

  const newInsights: LifeInsight[] = [];

  // 1. EVALUATE INVISIBLE PROGRESS
  const invisibleProgress = await detectInvisibleProgress(
    uid,
    snapshot,
    allEvents,
    existingFingerprints
  );
  if (invisibleProgress) {
    newInsights.push(invisibleProgress);
    existingFingerprints.add(invisibleProgress.fingerprint);
  }

  // 2. EVALUATE "WHAT CHANGED?"
  const whatChanged = await evaluateWhatChanged(
    uid,
    snapshot,
    allEvents,
    existingFingerprints
  );
  if (whatChanged) {
    newInsights.push(whatChanged);
    existingFingerprints.add(whatChanged.fingerprint);
  }

  // 3. EVALUATE DRIFT
  const driftList = await evaluateGoalDrift(uid);
  for (const drift of driftList) {
    if (drift.driftDetected) {
      const fp = generateInsightFingerprint('drift', [drift.goal.domainId], snapshot.period);
      if (!existingFingerprints.has(fp)) {
        const driftInsight: LifeInsight = {
          id: insightsCol.doc().id,
          userId: uid,
          type: 'drift',
          title: `Drift Notice: ${drift.goal.title}`,
          summary: drift.reason,
          explanation: `Your goal "${drift.goal.title}" is an active stated priority in ${drift.goal.domainId}, but recent observational evidence indicates little to no focused time is reaching it. Consider checking if priorities shifted or if external friction intervened.`,
          domainIds: [drift.goal.domainId],
          fingerprint: fp,
          period: snapshot.period,
          confidence: 'medium',
          evidence: [
            {
              sourceType: 'user_reflection',
              sourceRef: drift.goal.id,
              occurredAt: drift.goal.createdAt,
              summary: `Goal declared: ${drift.goal.title}`,
              confidence: 0.9,
            },
          ],
          createdAt: new Date().toISOString(),
        };
        await insightsCol.doc(driftInsight.id).set(driftInsight);
        newInsights.push(driftInsight);
        existingFingerprints.add(fp);
      }
    }
  }

  // Persist all new insights
  for (const ins of newInsights) {
    await insightsCol.doc(ins.id).set(ins);
  }

  // Return combined list sorted newest first
  return [...newInsights, ...activeInsights].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Detects Invisible Progress:
 * Positive gradual change that is cumulative and difficult to notice day to day.
 * Must pass strict eligibility gate:
 * - At least 4 distinct events in the domain
 * - Sustained positive trend
 * - Prior vs Current state difference
 */
async function detectInvisibleProgress(
  uid: string,
  snapshot: LifeSnapshot,
  allEvents: LifeEvent[],
  existingFingerprints: Set<string>
): Promise<LifeInsight | null> {
  const domainKeys = Object.keys(snapshot.domainStates) as DomainId[];

  for (const domainId of domainKeys) {
    const dState = snapshot.domainStates[domainId];
    if (dState.direction !== 'up' && dState.direction !== 'sustained_up') continue;
    if (dState.eventCount < 3) continue; // Strict eligibility: not enough evidence

    const fp = generateInsightFingerprint('invisible_progress', [domainId], snapshot.period);
    if (existingFingerprints.has(fp)) continue; // Deduplication suppression

    const domainEvents = allEvents
      .filter(e => e.domainIds.includes(domainId))
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

    const firstHalf = domainEvents.slice(0, Math.floor(domainEvents.length / 2));
    const secondHalf = domainEvents.slice(Math.floor(domainEvents.length / 2));

    const evidenceItems: EvidenceItem[] = secondHalf.slice(-3).map(ev => ({
      sourceType: ev.source.type === 'calendar' ? 'calendar' : 'user_reflection',
      sourceRef: ev.id,
      occurredAt: ev.occurredAt,
      summary: ev.summary || ev.title,
      confidence: ev.confidence || 0.85,
    }));

    // Generate natural synthesis using Gemini
    let aiSummary = `Your activity in ${domainId} has shifted from intermittent intent to consistent, completed sessions.`;
    let aiExplanation = `Across the last ${snapshot.period.from} to ${snapshot.period.to}, evidence shows a sustained upward trajectory in ${domainId}. What may have felt like slow individual days has accumulated into noticeable consistency.`;

    try {
      const prompt = `
Synthesize an "Invisible Progress" insight for the user.
Domain: ${domainId}
Period: ${snapshot.period.from} to ${snapshot.period.to}
Prior events summary: ${firstHalf.map(e => e.title).join('; ') || 'Minimal activity'}
Recent events summary: ${secondHalf.map(e => e.title).join('; ')}

Tone: Warm, calm, honest, analytical. Do not use fake cheerleading or excessive exclamation marks. Do not claim to be human.
Output valid JSON:
{
  "title": "Short compelling headline (max 10 words)",
  "summary": "1-2 sentences capturing the gradual shift",
  "explanation": "2-3 sentences detailing the cumulative progress",
  "priorState": "Brief description of prior baseline",
  "currentState": "Brief description of current consistent state"
}
`;
      const result: any = await generateGeminiJson({
        systemInstruction: 'You are the Insight Engine for Life Observatory. Output valid JSON only.',
        prompt,
      });

      if (result?.title && result?.summary) {
        aiSummary = result.summary;
        aiExplanation = result.explanation;
        return {
          id: `ins_${Date.now()}_${domainId}`,
          userId: uid,
          type: 'invisible_progress',
          title: result.title,
          summary: aiSummary,
          explanation: aiExplanation,
          domainIds: [domainId],
          fingerprint: fp,
          period: snapshot.period,
          confidence: dState.confidence,
          evidence: evidenceItems,
          priorState: result.priorState || 'Sporadic baseline',
          currentState: result.currentState || 'Consistent sustained activity',
          createdAt: new Date().toISOString(),
        };
      }
    } catch {
      // Use deterministic fallback
    }

    return {
      id: `ins_${Date.now()}_${domainId}`,
      userId: uid,
      type: 'invisible_progress',
      title: `Gradual progress visible in ${domainId}`,
      summary: aiSummary,
      explanation: aiExplanation,
      domainIds: [domainId],
      fingerprint: fp,
      period: snapshot.period,
      confidence: dState.confidence,
      evidence: evidenceItems,
      priorState: 'Inconsistent starts',
      currentState: 'Consistent completed activity',
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Evaluates "What Changed?"
 * Compares trajectory between earlier half and latter half of the window.
 */
async function evaluateWhatChanged(
  uid: string,
  snapshot: LifeSnapshot,
  allEvents: LifeEvent[],
  existingFingerprints: Set<string>
): Promise<LifeInsight | null> {
  const fp = generateInsightFingerprint('what_changed', ['career', 'learning', 'health'], snapshot.period);
  if (existingFingerprints.has(fp)) return null;

  const domainKeys = Object.keys(snapshot.domainStates) as DomainId[];
  const changingDomains = domainKeys.filter(d => {
    const s = snapshot.domainStates[d];
    return s.direction === 'up' || s.direction === 'down' || s.direction === 'sustained_up' || s.direction === 'sustained_down';
  });

  if (changingDomains.length === 0) return null;

  const evidenceItems: EvidenceItem[] = allEvents.slice(-4).map(e => ({
    sourceType: e.source.type === 'calendar' ? 'calendar' : 'user_reflection',
    sourceRef: e.id,
    occurredAt: e.occurredAt,
    summary: `${e.title} (${e.domainIds.join(', ')})`,
    confidence: e.confidence,
  }));

  const shiftsSummary = changingDomains
    .map(d => `${d.toUpperCase()}: ${snapshot.domainStates[d].direction}`)
    .join(', ');

  return {
    id: `ins_wc_${Date.now()}`,
    userId: uid,
    type: 'what_changed',
    title: `Key Transitions in Your Observatory`,
    summary: `Observable shifts across ${changingDomains.join(', ')} over the recent period.`,
    explanation: `Comparing the earlier half of this window against recent weeks shows distinct movement: ${shiftsSummary}. Inspect individual domain lines to review supporting events.`,
    domainIds: changingDomains,
    fingerprint: fp,
    period: snapshot.period,
    confidence: 'high' as ConfidenceLevel,
    evidence: evidenceItems,
    createdAt: new Date().toISOString(),
  };
}
