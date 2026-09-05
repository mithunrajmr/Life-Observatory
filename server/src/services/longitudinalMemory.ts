import { DomainId, LifeSnapshot, TurningPoint, Goal, Prediction, LifeEvent, Reflection } from '../types';
import { getUserSubcollection } from './firebaseAdmin';

export interface LongitudinalMemoryRecord {
  id: string;
  userId: string;
  category: 'habit_anchor' | 'turning_point' | 'stated_intention' | 'observed_tradeoff' | 'calibration_outcome';
  title: string;
  summary: string;
  domainIds: DomainId[];
  status: 'active' | 'confirmed' | 'superseded';
  confidence: number;
  provenanceRefs: Array<{
    sourceType: string;
    sourceRef: string;
    occurredAt: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Retrieves the stored longitudinal memories for a user.
 */
export async function getLongitudinalMemory(uid: string): Promise<LongitudinalMemoryRecord[]> {
  const memCol = getUserSubcollection(uid, 'memories');
  const snap = await memCol.get();
  const records: LongitudinalMemoryRecord[] = [];
  snap.forEach(d => records.push(d.data() as LongitudinalMemoryRecord));
  return records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Derives and updates durable longitudinal memory representations from:
 * - Stated goals/intentions
 * - Confirmed turning points
 * - Sustained domain trajectories (habit anchors)
 * - Evaluated predictions
 */
export async function updateLongitudinalMemory(
  uid: string,
  snapshot: LifeSnapshot
): Promise<LongitudinalMemoryRecord[]> {
  const memCol = getUserSubcollection(uid, 'memories');
  const existingMemories = await getLongitudinalMemory(uid);
  const existingKeys = new Set(existingMemories.map(m => `${m.category}_${m.title}`));

  const newRecords: LongitudinalMemoryRecord[] = [];

  // 1. Convert Confirmed Turning Points into Durable Memories
  const tpCol = getUserSubcollection(uid, 'turningPoints');
  const tpSnap = await tpCol.where('status', '==', 'confirmed').get();
  tpSnap.forEach(d => {
    const tp = d.data() as TurningPoint;
    const key = `turning_point_${tp.title}`;
    if (!existingKeys.has(key)) {
      const evidenceList: any[] = tp.evidenceRefs || tp.evidence || [];
      const timestamp = tp.occurredAt || tp.timestamp || new Date().toISOString();
      const domainList = tp.domains || (tp.domainId ? [tp.domainId] : ['personal']);

      newRecords.push({
        id: `mem_tp_${tp.id}`,
        userId: uid,
        category: 'turning_point',
        title: tp.title,
        summary: tp.description || tp.trajectoryShiftSummary || 'Significant life trajectory shift confirmed by user.',
        domainIds: domainList as DomainId[],
        status: 'confirmed',
        confidence: 0.95,
        provenanceRefs: evidenceList.map((ref: any) => ({
          sourceType: 'user_reflection',
          sourceRef: typeof ref === 'string' ? ref : (ref?.sourceRef || 'unknown'),
          occurredAt: timestamp,
        })),
        createdAt: timestamp,
        updatedAt: new Date().toISOString(),
      });
      existingKeys.add(key);
    }
  });

  // 2. Identify Sustained Habit Anchors (Domains with >= 4 events and sustained_up trend)
  for (const [dom, state] of Object.entries(snapshot.domainStates)) {
    if (state.direction === 'sustained_up' && state.eventCount >= 4) {
      const key = `habit_anchor_${dom}`;
      if (!existingKeys.has(key)) {
        newRecords.push({
          id: `mem_anchor_${dom}`,
          userId: uid,
          category: 'habit_anchor',
          title: `Sustained ${dom.charAt(0).toUpperCase() + dom.slice(1)} Habit Anchor`,
          summary: `Consistent momentum sustained across ${snapshot.period.from} to ${snapshot.period.to}.`,
          domainIds: [dom as DomainId],
          status: 'active',
          confidence: state.confidence === 'high' ? 0.9 : 0.8,
          provenanceRefs: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        existingKeys.add(key);
      }
    }
  }

  // Persist any newly derived records
  for (const record of newRecords) {
    await memCol.doc(record.id).set(record);
  }

  return [...newRecords, ...existingMemories];
}

/**
 * Builds grounded companion context specifically for the authenticated user.
 * Explicitly separates:
 * - Observed facts (events, timestamps, reflections)
 * - User-stated intentions (goals)
 * - Longitudinal memory (confirmed anchors & turning points)
 */
export async function getGroundedCompanionContext(uid: string): Promise<{
  contextSummary: string;
  memories: LongitudinalMemoryRecord[];
  activeIntentions: string[];
  confirmedTurningPoints: string[];
  totalReflectionsCount: number;
}> {
  // Fetch actual user memories
  const memories = await getLongitudinalMemory(uid);

  // Fetch active goals
  const goalsCol = getUserSubcollection(uid, 'goals');
  const goalsSnap = await goalsCol.where('status', '==', 'active').get();
  const activeIntentions: string[] = [];
  goalsSnap.forEach(d => {
    const g = d.data() as Goal;
    activeIntentions.push(`[${g.domainId}] ${g.title}`);
  });

  // Fetch confirmed turning points
  const tpCol = getUserSubcollection(uid, 'turningPoints');
  const tpSnap = await tpCol.where('status', '==', 'confirmed').limit(5).get();
  const confirmedTurningPoints: string[] = [];
  tpSnap.forEach(d => {
    const tp = d.data() as TurningPoint;
    confirmedTurningPoints.push(`${tp.title}: ${tp.description || tp.trajectoryShiftSummary}`);
  });

  // Fetch reflections (both count and recent texts)
  const refCol = getUserSubcollection(uid, 'reflections');
  const refSnap = await refCol.get();
  const totalReflectionsCount = refSnap.docs ? refSnap.docs.length : ((refSnap as any).size || 0);

  const sections: string[] = [];

  if (totalReflectionsCount === 0 && memories.length === 0) {
    sections.push('OBSERVED STATUS: Brand new observatory. No reflections recorded yet.');
  } else {
    sections.push(`OBSERVED RECORD: ${totalReflectionsCount} written reflections on record.`);
  }

  // Load and format recent user reflections
  const allRefs: Reflection[] = [];
  refSnap.forEach(d => allRefs.push(d.data() as Reflection));
  allRefs.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  const recentRefs = allRefs.slice(0, 10);
  if (recentRefs.length > 0) {
    const refLines = recentRefs.map(r => 
      `[${new Date(r.occurredAt).toISOString().split('T')[0]}] "${r.content}"`
    );
    sections.push(`RECORDED USER REFLECTIONS:\n${refLines.join('\n')}`);
  }

  // Fetch recent workspace activities (calendar, drive, gmail, etc.)
  try {
    const eventsCol = getUserSubcollection(uid, 'events');
    const recentEventsSnap = await eventsCol.orderBy('occurredAt', 'desc').limit(20).get().catch(async () => {
      return await eventsCol.limit(20).get();
    });
    const recentEvents: LifeEvent[] = [];
    recentEventsSnap.forEach(d => recentEvents.push(d.data() as LifeEvent));
    if (recentEvents.length > 0) {
      const eventLines = recentEvents.slice(0, 12).map(e => 
        `[${new Date(e.occurredAt).toISOString().split('T')[0]} | Source: ${e.source.type}] ${e.title} - ${e.summary}`
      );
      sections.push(`RECORDED WORKSPACE ACTIVITIES & CALENDAR EVENTS:\n${eventLines.join('\n')}`);
    }
  } catch {
    // Non-blocking if events index is pending
  }

  if (activeIntentions.length > 0) {
    sections.push(`USER INTENTIONS: ${activeIntentions.join('; ')}`);
  }

  if (confirmedTurningPoints.length > 0) {
    sections.push(`CONFIRMED TURNING POINTS: ${confirmedTurningPoints.join('; ')}`);
  }

  if (memories.length > 0) {
    const memLines = memories.slice(0, 5).map(m => `[${m.category}] ${m.title}: ${m.summary}`);
    sections.push(`LONGITUDINAL MEMORY ANCHORS:\n${memLines.join('\n')}`);
  }

  return {
    contextSummary: sections.join('\n\n'),
    memories,
    activeIntentions,
    confirmedTurningPoints,
    totalReflectionsCount,
  };
}
