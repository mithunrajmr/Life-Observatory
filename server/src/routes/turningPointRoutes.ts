import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getUserSubcollection } from '../services/firebaseAdmin';
import { TurningPoint } from '../types';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  try {
    const tpCol = getUserSubcollection(uid, 'turningPoints');
    const snap = await tpCol.get();
    const turningPoints: TurningPoint[] = [];
    snap.forEach(d => turningPoints.push(d.data() as TurningPoint));
    turningPoints.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    res.json({ turningPoints });
  } catch {
    res.status(500).json({ error: { code: 'TURNING_POINTS_FETCH_FAILED', message: 'Failed to fetch turning points.' } });
  }
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const tpId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const { status, title, description } = req.body;

  try {
    const tpRef = getUserSubcollection(uid, 'turningPoints').doc(tpId);
    const snap = await tpRef.get();
    if (!snap.exists) {
      res.status(404).json({ error: { code: 'TURNING_POINT_NOT_FOUND', message: 'Turning point not found.' } });
      return;
    }

    const updates: Partial<TurningPoint> = {};
    if (status && ['candidate', 'confirmed', 'rejected'].includes(status)) {
      updates.status = status;
    }
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();

    await tpRef.update(updates);
    const updated = (await tpRef.get()).data() as TurningPoint;
    res.json({ turningPoint: updated });
  } catch {
    res.status(500).json({ error: { code: 'TURNING_POINT_UPDATE_FAILED', message: 'Could not update turning point.' } });
  }
});

export default router;
