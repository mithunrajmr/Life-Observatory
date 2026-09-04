import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { computeLifeHorizon } from '../services/lifeModelEngine';
import { synthesizeProactiveInsights } from '../services/insightEngine';
import { getUserSubcollection } from '../services/firebaseAdmin';
import { LifeSnapshot } from '../types';

const router = Router();

router.get('/horizon', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const timeframeWeeks = parseInt((req.query.weeks as string) || '12', 10);

  try {
    const snapshotsCol = getUserSubcollection(uid, 'snapshots');
    const latestDoc = await snapshotsCol.doc('latest').get();

    let snapshot: LifeSnapshot;
    if (latestDoc.exists) {
      snapshot = latestDoc.data() as LifeSnapshot;
    } else {
      // Deterministically generate initial snapshot
      snapshot = await computeLifeHorizon(uid, timeframeWeeks);
    }

    // Attach active proactive insights
    const insightsCol = getUserSubcollection(uid, 'insights');
    const insightsSnap = await insightsCol.limit(10).get();
    const insights: any[] = [];
    insightsSnap.forEach(d => insights.push(d.data()));

    snapshot.insights = insights;

    res.json({ snapshot });
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'HORIZON_CALCULATION_FAILED',
        message: 'Could not load Life Horizon data.',
      },
    });
  }
});

router.post('/recompute', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const timeframeWeeks = parseInt((req.body.weeks as string) || '12', 10);

  try {
    const snapshot = await computeLifeHorizon(uid, timeframeWeeks);
    const insights = await synthesizeProactiveInsights(uid, snapshot);
    snapshot.insights = insights;

    res.json({ snapshot });
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'RECOMPUTE_FAILED',
        message: 'Unable to recalculate Life Horizon.',
      },
    });
  }
});

export default router;
