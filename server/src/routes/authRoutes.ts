import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getUserSubcollection } from '../services/firebaseAdmin';

const router = Router();

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;

  try {
    const connectionsSnap = await getUserSubcollection(uid, 'connections').get();
    const connections: Record<string, any> = {};
    connectionsSnap.forEach(doc => {
      connections[doc.id] = doc.data();
    });

    res.json({
      user: {
        uid,
        email: req.user!.email || null,
      },
      connections,
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'USER_FETCH_FAILED',
        message: 'Could not fetch user profile details.',
      },
    });
  }
});

export default router;
