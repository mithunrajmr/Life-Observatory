import { describe, it, expect, vi } from 'vitest';
import { getGroundedCompanionContext } from '../server/src/services/longitudinalMemory';
import { synthesizeProactiveInsights } from '../server/src/services/insightEngine';
import { LifeSnapshot } from '../server/src/types';

const mockDb: Record<string, any[]> = {};

vi.mock('../server/src/services/firebaseAdmin', () => ({
  getUserSubcollection: (uid: string, colName: string) => {
    const key = `${uid}/${colName}`;
    const makeSnap = () => {
      const items = mockDb[key] || [];
      return {
        empty: items.length === 0,
        docs: items.map(item => ({ id: item.id, data: () => item })),
        forEach: (cb: any) => items.forEach(item => cb({ id: item.id, data: () => item })),
      };
    };
    return {
      get: async () => makeSnap(),
      where: () => ({
        get: async () => makeSnap(),
        limit: () => ({
          get: async () => makeSnap(),
        }),
      }),
      orderBy: () => ({
        limit: () => ({
          get: async () => makeSnap(),
        }),
      }),
      doc: (docId?: string) => {
        const id = docId || `doc_${Date.now()}`;
        return {
          id,
          get: async () => {
            const item = (mockDb[key] || []).find(i => i.id === id);
            return { exists: !!item, data: () => item || null };
          },
          set: async (data: any) => {
            if (!mockDb[key]) mockDb[key] = [];
            mockDb[key].push({ ...data, id });
          },
        };
      },
    };
  },
}));

describe('Longitudinal Grounded Memory & Honest Evidence Gating', () => {
  it('getGroundedCompanionContext provides honest, unhallucinated context for a fresh user', async () => {
    const freshUid = 'user_grounded_fresh_99';
    const ctx = await getGroundedCompanionContext(freshUid);

    expect(ctx.memories).toEqual([]);
    expect(ctx.confirmedTurningPoints).toEqual([]);
    expect(ctx.activeIntentions).toEqual([]);
    expect(ctx.totalReflectionsCount).toBe(0);
    expect(ctx.contextSummary).toContain('No reflections recorded yet');
  });

  it('synthesizeProactiveInsights returns ZERO manufactured insights when user has sparse data (< 3 events)', async () => {
    const sparseUid = 'user_sparse_123';
    // Add only 1 event to mockDb
    mockDb[`${sparseUid}/events`] = [
      {
        id: 'ev_sparse_1',
        userId: sparseUid,
        title: 'Initial Welcome Session',
        domainIds: ['learning'],
        source: { type: 'calendar', externalId: 'ext_1', syncTime: '2026-09-01T10:00:00Z' },
        occurredAt: '2026-09-01T10:00:00Z',
        intensity: 0.5,
      },
    ];

    const mockSnapshot: LifeSnapshot = {
      id: 'snap_1',
      userId: sparseUid,
      calculatedAt: '2026-09-05T00:00:00Z',
      period: { from: '2026-08-01', to: '2026-09-05' },
      domains: {},
      summaryNarrative: 'Initial observation period.',
      divergences: [],
    };

    const insights = await synthesizeProactiveInsights(sparseUid, mockSnapshot);
    // Must return empty array - no manufactured July sprint, no synthetic cards
    expect(insights).toEqual([]);
  });

  it('getGroundedCompanionContext pulls confirmed memories when available', async () => {
    const activeUid = 'user_active_with_memories';
    mockDb[`${activeUid}/memories`] = [
      {
        id: 'anchor_health',
        userId: activeUid,
        type: 'habit_anchor',
        title: 'Morning 6:30 AM Runs',
        domain: 'health',
        summary: 'Consistent 4-day weekly morning run routine.',
        confidence: 0.95,
        firstObserved: '2026-08-10',
        lastObserved: '2026-09-04',
      },
    ];

    const ctx = await getGroundedCompanionContext(activeUid);
    expect(ctx.memories.length).toBe(1);
    expect(ctx.memories[0].title).toBe('Morning 6:30 AM Runs');
    expect(ctx.contextSummary).toContain('Morning 6:30 AM Runs');
  });
});
