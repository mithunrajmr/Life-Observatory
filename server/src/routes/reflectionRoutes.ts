import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { aiRateLimiter, validatePayloadSize } from '../middleware/rateLimit';
import { processReflection } from '../services/ingestionEngine';
import { computeLifeHorizon } from '../services/lifeModelEngine';
import { synthesizeProactiveInsights } from '../services/insightEngine';
import { getUserSubcollection } from '../services/firebaseAdmin';
import { Reflection } from '../types';

const router = Router();

router.post(
  '/',
  requireAuth,
  aiRateLimiter,
  validatePayloadSize(10000),
  async (req: AuthenticatedRequest, res: Response) => {
    const uid = req.user!.uid;
    const { content, occurredAt } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({
        error: {
          code: 'EMPTY_REFLECTION',
          message: 'Reflection content cannot be empty.',
        },
      });
      return;
    }

    try {
      // 1. Layer A: Ingest and extract structured events
      const { reflection, events, followUpQuestion } = await processReflection(
        uid,
        content.trim(),
        occurredAt
      );

      // 2. Layer B: Compute deterministic Life Horizon update
      const snapshot = await computeLifeHorizon(uid);

      // 3. Layer C: Proactive synthesis in background / response
      synthesizeProactiveInsights(uid, snapshot).catch(err => {
        console.error('[Async Insight Synthesis]', err.message);
      });

      res.status(201).json({
        reflection,
        events,
        followUpQuestion,
        message: 'Reflection recorded and incorporated into your Life Observatory.',
      });
    } catch (error: any) {
      res.status(500).json({
        error: {
          code: 'REFLECTION_INGESTION_FAILED',
          message: 'Could not process reflection at this time. Please try again.',
        },
      });
    }
  }
);

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;

  try {
    let reflections: Reflection[] = [];
    try {
      const reflectionsSnap = await getUserSubcollection(uid, 'reflections')
        .orderBy('occurredAt', 'desc')
        .limit(30)
        .get();
      reflectionsSnap.forEach(doc => {
        reflections.push(doc.data() as Reflection);
      });
    } catch {
      const snap = await getUserSubcollection(uid, 'reflections').get();
      snap.forEach(d => reflections.push(d.data() as Reflection));
      reflections.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    }

    // Fetch reflection-sourced events to populate signals and domain
    const eventsSnap = await getUserSubcollection(uid, 'events')
      .where('source.type', '==', 'reflection')
      .get()
      .catch(() => null);

    const eventsByRef = new Map<string, any[]>();
    if (eventsSnap) {
      eventsSnap.forEach(d => {
        const ev = d.data();
        const refId = ev.source?.ref;
        if (refId) {
          if (!eventsByRef.has(refId)) eventsByRef.set(refId, []);
          eventsByRef.get(refId)!.push(ev);
        }
      });
    }

    const enriched = reflections.map(r => ({
      ...r,
      events: eventsByRef.get(r.id) || [],
    }));

    res.json({ reflections: enriched });
  } catch {
    res.status(500).json({
      error: {
        code: 'FETCH_REFLECTIONS_FAILED',
        message: 'Unable to retrieve reflections.',
      },
    });
  }
});

export default router;
