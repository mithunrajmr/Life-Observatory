import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LifeEvent, DomainId } from '../server/src/types';
import { computeLifeHorizon, detectTurningPoints } from '../server/src/services/lifeModelEngine';
import { generateInsightFingerprint } from '../server/src/services/insightEngine';

// Mock Firebase Admin so the test runs completely isolated and deterministically
const mockFirestoreData: Record<string, any[]> = {};

vi.mock('../server/src/services/firebaseAdmin', () => ({
  getUserSubcollection: (uid: string, colName: string) => ({
    get: async () => {
      const key = `${uid}/${colName}`;
      const items = mockFirestoreData[key] || [];
      return {
        empty: items.length === 0,
        forEach: (cb: any) => items.forEach((item) => cb({ data: () => item })),
        docs: items.map((item) => ({ data: () => item, id: item.id })),
      };
    },
    doc: (docId?: string) => {
      const id = docId || `doc_${Date.now()}_${Math.random()}`;
      return {
        id,
        get: async () => ({
          exists: false,
          data: () => null,
        }),
        set: async (data: any) => {
          const key = `${uid}/${colName}`;
          if (!mockFirestoreData[key]) mockFirestoreData[key] = [];
          mockFirestoreData[key].push({ ...data, id });
        },
        update: async (data: any) => {},
      };
    },
  }),
}));

describe('Golden Life Model Test (Section 20)', () => {
  const testUid = 'golden_user_123';

  beforeEach(() => {
    mockFirestoreData[`${testUid}/events`] = [];
    mockFirestoreData[`${testUid}/turningPoints`] = [];
    mockFirestoreData[`${testUid}/snapshots`] = [];
    mockFirestoreData[`${testUid}/insights`] = [];
    mockFirestoreData[`${testUid}/goals`] = [];
  });

  it('correctly models longitudinal progression, turning points, and trajectory shifts', async () => {
    const now = new Date();
    const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

    // 1. January: Mostly planning (70 days ago)
    const event1: LifeEvent = {
      id: 'ev_jan_plan',
      userId: testUid,
      type: 'activity',
      domainIds: ['learning'],
      title: 'Researched course curriculum',
      summary: 'Looked up online courses for systems programming.',
      occurredAt: daysAgo(70),
      createdAt: daysAgo(70),
      source: { type: 'reflection', ref: 'r1' },
      confidence: 0.9,
      sentiment: 'neutral',
      intensity: 2,
      isTurningPointCandidate: false,
    };

    // 2. February: First completed learning sessions (50 & 45 days ago)
    const event2: LifeEvent = {
      id: 'ev_feb_learn_1',
      userId: testUid,
      type: 'activity',
      domainIds: ['learning'],
      title: 'Completed first module',
      summary: 'Finished module 1 and basic exercises.',
      occurredAt: daysAgo(50),
      createdAt: daysAgo(50),
      source: { type: 'reflection', ref: 'r2' },
      confidence: 0.95,
      sentiment: 'positive',
      intensity: 3,
      isTurningPointCandidate: false,
    };

    const event3: LifeEvent = {
      id: 'ev_feb_learn_2',
      userId: testUid,
      type: 'activity',
      domainIds: ['learning'],
      title: 'Submitted coursework',
      summary: 'Completed homework assignment on concurrency.',
      occurredAt: daysAgo(42),
      createdAt: daysAgo(42),
      source: { type: 'reflection', ref: 'r3' },
      confidence: 0.95,
      sentiment: 'positive',
      intensity: 3,
      isTurningPointCandidate: false,
    };

    // 3. March: Consistent learning (28, 21, 14 days ago)
    const event4: LifeEvent = {
      id: 'ev_mar_learn_3',
      userId: testUid,
      type: 'achievement',
      domainIds: ['learning'],
      title: 'Built mini compiler',
      summary: 'Shipped working prototype project.',
      occurredAt: daysAgo(28),
      createdAt: daysAgo(28),
      source: { type: 'reflection', ref: 'r4' },
      confidence: 0.95,
      sentiment: 'positive',
      intensity: 4,
      isTurningPointCandidate: false,
    };

    const event5: LifeEvent = {
      id: 'ev_mar_learn_4',
      userId: testUid,
      type: 'routine',
      domainIds: ['learning'],
      title: 'Daily practice streak',
      summary: 'Maintained 14-day streak of active practice.',
      occurredAt: daysAgo(14),
      createdAt: daysAgo(14),
      source: { type: 'reflection', ref: 'r5' },
      confidence: 0.98,
      sentiment: 'positive',
      intensity: 4,
      isTurningPointCandidate: false,
    };

    // 4. April: Health declines (12 & 6 days ago)
    const event6: LifeEvent = {
      id: 'ev_apr_health_down',
      userId: testUid,
      type: 'setback',
      domainIds: ['health'],
      title: 'Severe back strain & missed gym',
      summary: 'Injured lower back, unable to exercise for two weeks.',
      occurredAt: daysAgo(12),
      createdAt: daysAgo(12),
      source: { type: 'reflection', ref: 'r6' },
      confidence: 0.92,
      sentiment: 'negative',
      intensity: 4,
      isTurningPointCandidate: false,
    };

    const event7: LifeEvent = {
      id: 'ev_apr_health_down_2',
      userId: testUid,
      type: 'setback',
      domainIds: ['health'],
      title: 'Poor sleep and fatigue',
      summary: 'Only 4 hours of broken sleep, chronic exhaustion.',
      occurredAt: daysAgo(6),
      createdAt: daysAgo(6),
      source: { type: 'reflection', ref: 'r7' },
      confidence: 0.90,
      sentiment: 'negative',
      intensity: 4,
      isTurningPointCandidate: false,
    };

    // 5. May: Major project completed (Turning Point candidate) (2 days ago)
    const event8: LifeEvent = {
      id: 'ev_may_milestone',
      userId: testUid,
      type: 'milestone',
      domainIds: ['career', 'learning'],
      title: 'Launched Production Architecture',
      summary: 'Publicly launched the full platform to first 1,000 users.',
      occurredAt: daysAgo(2),
      createdAt: daysAgo(2),
      source: { type: 'reflection', ref: 'r8' },
      confidence: 0.99,
      sentiment: 'positive',
      intensity: 5,
      isTurningPointCandidate: true,
    };

    // Seed events into isolated user mock store
    mockFirestoreData[`${testUid}/events`] = [
      event1, event2, event3, event4, event5, event6, event7, event8
    ];

    // Compute deterministic snapshot
    const snapshot = await computeLifeHorizon(testUid, 12);

    // Verify 1: Learning trajectory is sustained UP
    const learningState = snapshot.domainStates['learning'];
    expect(learningState).toBeDefined();
    expect(['up', 'sustained_up']).toContain(learningState.direction);
    expect(learningState.eventCount).toBeGreaterThanOrEqual(4);
    expect(learningState.confidence).toBe('medium');

    // Verify 2: Health trajectory reflects DECLINE
    const healthState = snapshot.domainStates['health'];
    expect(healthState).toBeDefined();
    expect(healthState.direction).toBe('down');
    expect(healthState.trendScore).toBeLessThan(0);

    // Verify 3: Turning Point detected for the major milestone
    const turningPoints = await detectTurningPoints(testUid, [
      event1, event2, event3, event4, event5, event6, event7, event8
    ]);
    expect(turningPoints.length).toBeGreaterThanOrEqual(1);
    const milestoneTp = turningPoints.find(tp => tp.eventId === 'ev_may_milestone');
    expect(milestoneTp).toBeDefined();
    expect(milestoneTp?.title).toBe('Launched Production Architecture');

    // Verify 4: Insight deduplication fingerprint is stable and deterministic
    const fp1 = generateInsightFingerprint('invisible_progress', ['learning'], snapshot.period);
    const fp2 = generateInsightFingerprint('invisible_progress', ['learning'], snapshot.period);
    expect(fp1).toBe(fp2);
  });
});
