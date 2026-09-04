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
    const reflectionsSnap = await getUserSubcollection(uid, 'reflections')
      .orderBy('occurredAt', 'desc')
      .limit(30)
      .get();

    const reflections: Reflection[] = [];
    reflectionsSnap.forEach(doc => {
      reflections.push(doc.data() as Reflection);
    });

    res.json({ reflections });
  } catch {
    // If indexing is pending, fallback to simple fetch
    try {
      const snap = await getUserSubcollection(uid, 'reflections').get();
      const reflections: Reflection[] = [];
      snap.forEach(d => reflections.push(d.data() as Reflection));
      reflections.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
      res.json({ reflections });
    } catch {
      res.status(500).json({
        error: {
          code: 'FETCH_REFLECTIONS_FAILED',
          message: 'Unable to retrieve reflections.',
        },
      });
    }
  }
});

export default router;
