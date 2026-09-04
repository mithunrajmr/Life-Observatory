import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getUserSubcollection } from '../services/firebaseAdmin';
import { Goal, DomainId } from '../types';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  try {
    const goalsCol = getUserSubcollection(uid, 'goals');
    const snap = await goalsCol.get();
    const goals: Goal[] = [];
    snap.forEach(d => goals.push(d.data() as Goal));
    goals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ goals });
  } catch {
    res.status(500).json({ error: { code: 'GOALS_FETCH_FAILED', message: 'Failed to fetch goals.' } });
  }
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const { title, domainId, targetDate, notes } = req.body;

  if (!title || !domainId) {
    res.status(400).json({ error: { code: 'INVALID_GOAL_DATA', message: 'Title and domainId are required.' } });
    return;
  }

  try {
    const goalsCol = getUserSubcollection(uid, 'goals');
    const newDoc = goalsCol.doc();
    const goal: Goal = {
      id: newDoc.id,
      userId: uid,
      title: title.trim(),
      domainId: domainId as DomainId,
      status: 'active',
      targetDate: targetDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidenceRefs: [],
      notes: notes?.trim() || undefined,
    };

    await newDoc.set(goal);
    res.status(201).json({ goal });
  } catch {
    res.status(500).json({ error: { code: 'GOAL_CREATE_FAILED', message: 'Could not create goal.' } });
  }
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const goalId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const { status, title, notes } = req.body;

  try {
    const goalRef = getUserSubcollection(uid, 'goals').doc(goalId);
    const snap = await goalRef.get();
    if (!snap.exists) {
      res.status(404).json({ error: { code: 'GOAL_NOT_FOUND', message: 'Goal does not exist.' } });
      return;
    }

    const updates: Partial<Goal> = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (title) updates.title = title.trim();
    if (notes !== undefined) updates.notes = notes.trim();

    await goalRef.update(updates);
    const updated = (await goalRef.get()).data() as Goal;
    res.json({ goal: updated });
  } catch {
    res.status(500).json({ error: { code: 'GOAL_UPDATE_FAILED', message: 'Could not update goal.' } });
  }
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const goalId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

  try {
    const goalRef = getUserSubcollection(uid, 'goals').doc(goalId);
    await goalRef.delete();
    res.json({ success: true, deletedId: goalId });
  } catch {
    res.status(500).json({ error: { code: 'GOAL_DELETE_FAILED', message: 'Could not delete goal.' } });
  }
});

export default router;
