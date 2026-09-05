import { Router, Response } from 'express';
import crypto from 'crypto';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getUserSubcollection } from '../services/firebaseAdmin';
import { getOAuth2Client } from '../services/oauthService';

const router = Router();

/**
 * GET /api/auth/google
 * Initiates direct Google OAuth 2.0 authorization code flow.
 * Uses the already configured GCP Web Client and authorized redirect URI.
 */
router.get('/google', async (_req, res: Response) => {
  try {
    const oauth2Client = await getOAuth2Client();
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'select_account',
      scope: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state: `login_${crypto.randomBytes(16).toString('hex')}`,
    });
    res.redirect(url);
  } catch (error: any) {
    console.error('Failed to generate Google auth URL:', error);
    res.status(500).json({ error: { code: 'OAUTH_URL_FAILED', message: error.message } });
  }
});

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
    console.error('[auth/me error]:', error.message, error.stack);
    res.status(500).json({
      error: {
        code: 'USER_FETCH_FAILED',
        message: 'Could not fetch user profile details.',
        details: error.message,
      },
    });
  }
});

export default router;
