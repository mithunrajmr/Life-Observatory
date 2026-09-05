import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getUserSubcollection, getServerCredentialsSubcollection } from '../services/firebaseAdmin';
import { 
  getOAuth2Client,
  generateConsentUrl, 
  exchangeCodeForTokens, 
  revokeProviderConnection, 
  decodeSignedState,
  SupportedProvider,
  PROVIDER_DESCRIPTIONS 
} from '../services/oauthService';
import { defaultIngestionPipeline } from '../services/ingestionPipeline';
import { computeLifeHorizon } from '../services/lifeModelEngine';
import { updateLongitudinalMemory } from '../services/longitudinalMemory';
import { Connection } from '../types';
import { createSessionToken } from '../services/sessionTokenService';

const router = Router();

const SUPPORTED_PROVIDERS: SupportedProvider[] = ['google_calendar', 'gmail', 'google_drive'];

/**
 * GET /api/connections
 * Returns the status of all supported integrations for the authenticated user.
 */
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;

  try {
    const connCol = getUserSubcollection(uid, 'connections');
    const snap = await connCol.get();
    
    const existingMap = new Map<string, Connection>();
    snap.forEach(d => existingMap.set(d.id, d.data() as Connection));

    // Ensure all supported providers are reported with default offline status if not yet connected
    const connections: Connection[] = SUPPORTED_PROVIDERS.map(prov => {
      if (existingMap.has(prov)) {
        return existingMap.get(prov)!;
      }
      return {
        id: prov,
        userId: uid,
        provider: prov,
        status: 'disconnected',
        scopes: [],
        lastSyncAt: null,
        itemCount: 0,
      };
    });

    res.json({ connections, descriptions: PROVIDER_DESCRIPTIONS });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'FETCH_CONNECTIONS_FAILED', message: error.message } });
  }
});

/**
 * GET /api/connections/google/auth-url?provider=google_calendar
 * Generates an OAuth 2.0 consent URL for the requested provider with least-privilege scopes.
 */
router.get('/google/auth-url', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const provider = req.query.provider as SupportedProvider;
  const redirectUri = req.query.redirectUri as string | undefined;

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
    res.status(400).json({
      error: { code: 'INVALID_PROVIDER', message: `Provider must be one of: ${SUPPORTED_PROVIDERS.join(', ')}` },
    });
    return;
  }

  try {
    const url = await generateConsentUrl(uid, provider, redirectUri);
    res.json({ url, provider });
  } catch (error: any) {
    res.status(500).json({
      error: { code: 'OAUTH_URL_FAILED', message: error.message || 'Could not generate OAuth consent URL.' },
    });
  }
});

/**
 * POST /api/connections/google/exchange-code
 * Receives the authorization code from popup or redirect and safely exchanges it for tokens.
 * Tokens are stored strictly in the server-only credential store.
 */
router.post('/google/exchange-code', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const authUid = req.user!.uid;
  const { code, state, redirectUri } = req.body;

  if (!code || !state) {
    res.status(400).json({
      error: { code: 'MISSING_PARAMETERS', message: 'Both "code" and "state" are required.' },
    });
    return;
  }

  try {
    // Cross-user integrity check: validate state uid matches authenticated user before network exchange
    const decodedState = decodeSignedState(state);
    if (decodedState.uid !== authUid) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'OAuth state does not match authenticated user session.' },
      });
      return;
    }

    const { uid, provider } = await exchangeCodeForTokens(code, state, redirectUri);

    // Trigger initial background sync
    const syncResult = await defaultIngestionPipeline.syncProvider(uid, provider);

    // Update life horizon and memory
    const snapshot = await computeLifeHorizon(uid);
    await updateLongitudinalMemory(uid, snapshot);

    res.json({
      success: true,
      provider,
      syncedCount: syncResult.syncedCount,
      snapshot,
    });
  } catch (error: any) {
    res.status(500).json({
      error: { code: 'TOKEN_EXCHANGE_FAILED', message: error.message || 'Failed to complete OAuth exchange.' },
    });
  }
});

/**
 * GET /api/connections/google/callback
 * Browser redirect callback handler when not using popup flow.
 */
router.get('/google/callback', async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const error = req.query.error as string;

  if (error) {
    res.send(`<html><body><script>
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_OAUTH_ERROR', error: '${error}' }, '*');
        window.close();
      } else {
        window.location.href = '/?oauth_error=${encodeURIComponent(error)}';
      }
    </script><p>Authorization was not completed (${error}). You can close this window.</p></body></html>`);
    return;
  }

  if (!code || !state) {
    res.status(400).send('Missing code or state in callback.');
    return;
  }

  // Direct Google Login Flow
  if (state.startsWith('login_')) {
    try {
      const oauth2Client = await getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = (await import('googleapis')).google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data: profile } = await oauth2.userinfo.get();

      const uid = profile.id || `g_${(profile.email || 'user').replace(/[^a-zA-Z0-9]/g, '_')}`;
      const signedToken = createSessionToken({
        uid,
        email: profile.email || '',
        name: profile.name || profile.email || 'Observer',
        picture: profile.picture || '',
      });

      res.cookie('lo_session', signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400000 * 30, // 30 days
      });

      res.redirect(
        `/?auth_token=${encodeURIComponent(signedToken)}&email=${encodeURIComponent(profile.email || '')}&name=${encodeURIComponent(profile.name || '')}&picture=${encodeURIComponent(profile.picture || '')}&uid=${encodeURIComponent(uid)}`
      );
      return;
    } catch (err: any) {
      console.error('Direct Google login exchange failed:', err);
      res.redirect(`/?auth_error=${encodeURIComponent(err.message || 'Login failed')}`);
      return;
    }
  }

  // Workspace Provider Connection (Google Calendar, Gmail, Google Drive)
  try {
    const { uid, provider } = await exchangeCodeForTokens(code, state);

    // Trigger initial background sync & trajectory computation
    defaultIngestionPipeline.syncProvider(uid, provider)
      .then(async (syncResult) => {
        console.log(`[Ingestion] Synced ${syncResult.syncedCount} items for ${provider} (user ${uid})`);
        const snapshot = await computeLifeHorizon(uid);
        await updateLongitudinalMemory(uid, snapshot);
      })
      .catch((err) => {
        console.error(`[Ingestion] Background sync error for ${provider}:`, err);
      });

    res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Connected to ${provider}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F7F6F2; color: #1D2421; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #FFFFFF; border: 1px solid #DDE2DD; border-radius: 16px; padding: 28px; text-align: center; max-width: 340px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .icon { width: 48px; height: 48px; border-radius: 50%; background: #EBF2ED; color: #355C4A; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px; font-size: 22px; font-weight: bold; }
    h2 { font-size: 18px; margin: 0 0 8px 0; }
    p { font-size: 13px; color: #66706B; margin: 0 0 16px 0; line-height: 1.5; }
    button { background: #355C4A; color: white; border: none; padding: 9px 20px; border-radius: 9999px; font-size: 12px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h2>Connected Successfully!</h2>
    <p>Your <strong>${provider.replace('_', ' ')}</strong> connection is complete. Real observations are synchronizing now.</p>
    <button onclick="window.close()">Close Window</button>
  </div>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS', provider: '${provider}', synced: true }, '*');
      }
    } catch (e) {}
    setTimeout(() => {
      try { window.close(); } catch(e) { window.location.href = '/'; }
    }, 1200);
  </script>
</body>
</html>`);
  } catch (error: any) {
    console.error('Server OAuth exchange failed in callback:', error);
    res.status(500).send(`<html><body style="font-family: sans-serif; padding: 24px;">
      <h2>Connection Error</h2>
      <p>${error.message || 'Could not exchange authorization code.'}</p>
      <button onclick="window.close()">Close</button>
    </body></html>`);
  }
});

/**
 * POST /api/connections/:provider/sync
 * Manually triggers an incremental synchronization for the connected provider.
 */
router.post('/:provider/sync', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const provider = (Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider) as SupportedProvider;

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    res.status(400).json({ error: { code: 'INVALID_PROVIDER', message: 'Unsupported provider.' } });
    return;
  }

  try {
    const syncRes = await defaultIngestionPipeline.syncProvider(uid, provider);
    if (!syncRes.success) {
      res.status(502).json({
        error: { code: 'SYNC_ERROR', message: syncRes.error || 'Failed to sync with provider.' },
      });
      return;
    }

    const snapshot = await computeLifeHorizon(uid);
    await updateLongitudinalMemory(uid, snapshot);

    res.json({
      success: true,
      provider,
      syncedCount: syncRes.syncedCount,
      snapshot,
    });
  } catch (error: any) {
    res.status(500).json({
      error: { code: 'SYNC_FAILED', message: error.message || 'Unable to sync provider.' },
    });
  }
});

/**
 * DELETE /api/connections/:provider
 * Revokes provider authorization and deletes stored credentials. Stops future ingestion.
 */
router.delete('/:provider', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const provider = (Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider) as SupportedProvider;

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    res.status(400).json({ error: { code: 'INVALID_PROVIDER', message: 'Unsupported provider.' } });
    return;
  }

  try {
    await revokeProviderConnection(uid, provider);
    res.json({ success: true, message: `Successfully disconnected ${provider}.` });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'DISCONNECT_FAILED', message: error.message } });
  }
});

/**
 * DELETE /api/connections/:provider/data
 * Deletes all normalized observations originating from this provider and recomputes the Life Horizon.
 */
router.delete('/:provider/data', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const provider = (Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider) as SupportedProvider;

  try {
    const eventsCol = getUserSubcollection(uid, 'events');
    const sourceType = provider === 'google_calendar' ? 'calendar' : 'other';
    const prefix = provider === 'google_calendar' ? 'cal_' : (provider === 'gmail' ? 'gmail_' : 'drive_');

    const snap = await eventsCol.get();
    const batch = eventsCol.firestore.batch();
    let deletedCount = 0;

    snap.forEach(doc => {
      const data = doc.data();
      if (data.source?.type === sourceType && doc.id.startsWith(prefix)) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    await batch.commit();

    // Reset item count on connection
    const connRef = getUserSubcollection(uid, 'connections').doc(provider);
    await connRef.set({ itemCount: 0 }, { merge: true });

    // Recompute Horizon and memory
    const snapshot = await computeLifeHorizon(uid);
    await updateLongitudinalMemory(uid, snapshot);

    res.json({
      success: true,
      message: `Deleted ${deletedCount} derived observations from ${provider}.`,
      snapshot,
    });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'DATA_DELETION_FAILED', message: error.message } });
  }
});

/**
 * DELETE /api/connections/user/all-data
 * Complete sovereign erasure: permanently deletes all user records and server credentials.
 */
router.delete('/user/all-data', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;

  const userCollections = [
    'reflections',
    'events',
    'conversations',
    'goals',
    'decisions',
    'predictions',
    'outcomes',
    'patterns',
    'turningPoints',
    'evidence',
    'insights',
    'snapshots',
    'connections',
    'memories',
  ];

  const credCollections = ['tokens', 'sync'];

  try {
    // 1. Revoke any connected OAuth providers
    for (const prov of SUPPORTED_PROVIDERS) {
      try {
        await revokeProviderConnection(uid, prov);
      } catch {
        // Continue erasure even if revocation fails
      }
    }

    // 2. Erase all user data subcollections
    for (const colName of userCollections) {
      const col = getUserSubcollection(uid, colName);
      const snap = await col.get();
      const batch = col.firestore.batch();
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }

    // 3. Erase all server credentials
    for (const colName of credCollections) {
      const col = getServerCredentialsSubcollection(uid, colName);
      const snap = await col.get();
      const batch = col.firestore.batch();
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }

    res.json({ success: true, message: 'All personal and derived records permanently erased.' });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'ERASURE_FAILED', message: error.message } });
  }
});

export default router;
