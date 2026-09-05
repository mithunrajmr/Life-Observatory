import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getUserSubcollection } from '../services/firebaseAdmin';
import { LifeInsight } from '../types';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;

  try {
    const insightsCol = getUserSubcollection(uid, 'insights');
    const snap = await insightsCol.get();
    const insights: LifeInsight[] = [];
    snap.forEach(d => insights.push(d.data() as LifeInsight));

    insights.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    res.json({ insights });
  } catch {
    res.status(500).json({
      error: {
        code: 'INSIGHTS_FETCH_FAILED',
        message: 'Could not fetch insights.',
      },
    });
  }
});

router.get('/invisible-progress', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;

  try {
    const insightsCol = getUserSubcollection(uid, 'insights');
    const snap = await insightsCol.where('type', '==', 'invisible_progress').limit(1).get();

    if (snap.empty) {
      res.json({ invisibleProgress: null });
      return;
    }

    const item = snap.docs[0].data() as LifeInsight;
    res.json({ invisibleProgress: item });
  } catch {
    res.status(500).json({
      error: {
        code: 'INVISIBLE_PROGRESS_FETCH_FAILED',
        message: 'Unable to retrieve Invisible Progress.',
      },
    });
  }
});

export default router;
