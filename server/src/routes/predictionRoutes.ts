import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getUserSubcollection } from '../services/firebaseAdmin';
import { Prediction, Outcome } from '../types';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  try {
    const predCol = getUserSubcollection(uid, 'predictions');
    const snap = await predCol.get();
    const predictions: Prediction[] = [];
    snap.forEach(d => predictions.push(d.data() as Prediction));
    predictions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ predictions });
  } catch {
    res.status(500).json({ error: { code: 'PREDICTIONS_FETCH_FAILED', message: 'Failed to fetch predictions.' } });
  }
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const { title, expectedOutcomes, reviewAt, decisionId } = req.body;

  if (!title || !expectedOutcomes || !Array.isArray(expectedOutcomes)) {
    res.status(400).json({ error: { code: 'INVALID_PREDICTION_DATA', message: 'Title and expected outcomes are required.' } });
    return;
  }

  try {
    const predCol = getUserSubcollection(uid, 'predictions');
    const docRef = predCol.doc();
    const prediction: Prediction = {
      id: docRef.id,
      userId: uid,
      title: title.trim(),
      decisionId,
      expectedOutcomes,
      reviewAt: reviewAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await docRef.set(prediction);
    res.status(201).json({ prediction });
  } catch {
    res.status(500).json({ error: { code: 'PREDICTION_CREATE_FAILED', message: 'Could not record prediction.' } });
  }
});

router.post('/:id/outcome', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const predictionId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const { actualOutcomes, userReflection, alignmentScore } = req.body;

  try {
    const predRef = getUserSubcollection(uid, 'predictions').doc(predictionId);
    const predSnap = await predRef.get();
    if (!predSnap.exists) {
      res.status(404).json({ error: { code: 'PREDICTION_NOT_FOUND', message: 'Prediction does not exist.' } });
      return;
    }

    const outcomesCol = getUserSubcollection(uid, 'outcomes');
    const outcomeDoc = outcomesCol.doc();

    const outcome: Outcome = {
      id: outcomeDoc.id,
      userId: uid,
      predictionId,
      actualOutcomes: actualOutcomes || [],
      alignmentScore: typeof alignmentScore === 'number' ? alignmentScore : 0.75,
      userReflection: userReflection?.trim() || '',
      evaluatedAt: new Date().toISOString(),
    };

    await outcomeDoc.set(outcome);
    await predRef.update({
      status: 'evaluated',
      actualOutcomeId: outcome.id,
    });

    res.status(201).json({ outcome });
  } catch {
    res.status(500).json({ error: { code: 'OUTCOME_SAVE_FAILED', message: 'Failed to record outcome.' } });
  }
});

export default router;
