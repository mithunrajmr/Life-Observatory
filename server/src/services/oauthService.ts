import { google } from 'googleapis';
import crypto from 'crypto';
import { getGoogleOAuthCredentials } from '../config/secrets';
import { getUserSubcollection, getServerCredentialsSubcollection } from './firebaseAdmin';

export type OAuth2Client = InstanceType<typeof google.auth.OAuth2>;

export type SupportedProvider = 'google_calendar' | 'gmail' | 'google_drive';

export const PROVIDER_SCOPES: Record<SupportedProvider, string[]> = {
  google_calendar: ['https://www.googleapis.com/auth/calendar.readonly'],
  gmail: ['https://www.googleapis.com/auth/gmail.metadata'],
  google_drive: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
};

export const PROVIDER_DESCRIPTIONS: Record<SupportedProvider, { title: string; purpose: string }> = {
  google_calendar: {
    title: 'Google Calendar',
    purpose: 'Read-only schedule cadence, focus blocks, meeting density, and restorative time patterns.',
  },
  gmail: {
    title: 'Gmail Activity Signals',
    purpose: 'Read-only email activity cadence and communication density metadata. No email bodies are stored.',
  },
  google_drive: {
    title: 'Google Drive Activity Signals',
    purpose: 'Read-only document creation and edit session timestamps. No document contents are accessed or stored.',
  },
};

export interface StoredTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string | null;
  expiry_date?: number | null;
  updatedAt: string;
}

/**
 * Creates and configures an OAuth2Client instance.
 */
export async function getOAuth2Client(customRedirectUri?: string): Promise<OAuth2Client> {
  const { clientId, clientSecret, redirectUri } = await getGoogleOAuthCredentials();
  return new google.auth.OAuth2(
    clientId || 'dummy-client-id-for-testing',
    clientSecret || 'dummy-client-secret',
    customRedirectUri || redirectUri
  );
}

/**
 * Generates an encoded state string containing user UID, target provider, and timestamp.
 */
function createSignedState(uid: string, provider: SupportedProvider): string {
  const payload = {
    uid,
    provider,
    ts: Date.now(),
    nonce: crypto.randomBytes(12).toString('hex'),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/**
 * Decodes and validates state payload.
 */
export function decodeSignedState(state: string): { uid: string; provider: SupportedProvider } {
  try {
    const json = Buffer.from(state, 'base64url').toString('utf8');
    const parsed = JSON.parse(json);
    if (!parsed.uid || !parsed.provider) {
      throw new Error('Invalid state parameters');
    }
    // Check 15 minute state expiration
    if (Date.now() - parsed.ts > 15 * 60 * 1000) {
      throw new Error('OAuth state expired. Please try connecting again.');
    }
    return { uid: parsed.uid, provider: parsed.provider };
  } catch (err: any) {
    throw new Error(`State validation failed: ${err.message}`);
  }
}

/**
 * Generates a Google consent URL for the requested provider with least-privilege scopes.
 */
export async function generateConsentUrl(
  uid: string,
  provider: SupportedProvider,
  redirectUri?: string
): Promise<string> {
  const oauth2Client = await getOAuth2Client(redirectUri);
  const scopes = PROVIDER_SCOPES[provider];
  if (!scopes) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const state = createSignedState(uid, provider);

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Requests refresh_token for background/incremental sync
    prompt: 'consent',     // Forces consent prompt so refresh_token is always returned
    scope: scopes,
    state,
    include_granted_scopes: true,
  });
}

/**
 * Exchanges authorization code for tokens and saves them in the secure server-only store.
 */
export async function exchangeCodeForTokens(
  code: string,
  state: string,
  redirectUri?: string
): Promise<{ uid: string; provider: SupportedProvider }> {
  const { uid, provider } = decodeSignedState(state);
  const oauth2Client = await getOAuth2Client(redirectUri);

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token && !tokens.refresh_token) {
    throw new Error('No tokens received from Google authorization server.');
  }

  // 1. Fetch existing credentials if any, so we preserve refresh_token if Google only returned new access_token
  const credsCol = getServerCredentialsSubcollection(uid, 'tokens');
  const existingCredDoc = await credsCol.doc(provider).get();
  const existingTokens = existingCredDoc.data() as StoredTokens | undefined;

  const mergedTokens: StoredTokens = {
    access_token: tokens.access_token || existingTokens?.access_token || null,
    refresh_token: tokens.refresh_token || existingTokens?.refresh_token || null,
    scope: tokens.scope || existingTokens?.scope || PROVIDER_SCOPES[provider].join(' '),
    token_type: tokens.token_type || existingTokens?.token_type || 'Bearer',
    expiry_date: tokens.expiry_date || existingTokens?.expiry_date || null,
    updatedAt: new Date().toISOString(),
  };

  // 2. Persist ONLY to server-only collection
  await credsCol.doc(provider).set(mergedTokens);

  // 3. Update public connection state (NO TOKENS STORED HERE)
  const userConnCol = getUserSubcollection(uid, 'connections');
  await userConnCol.doc(provider).set({
    id: provider,
    userId: uid,
    provider,
    status: 'connected',
    scopes: mergedTokens.scope ? mergedTokens.scope.split(' ') : PROVIDER_SCOPES[provider],
    connectedAt: new Date().toISOString(),
    lastSyncAt: null,
    itemCount: 0,
  }, { merge: true });

  return { uid, provider };
}

/**
 * Returns an authenticated OAuth2Client for the given user and provider.
 * Automatically refreshes access token using stored refresh token if expired.
 */
export async function getAuthenticatedOAuth2Client(
  uid: string,
  provider: SupportedProvider
): Promise<OAuth2Client> {
  const credsCol = getServerCredentialsSubcollection(uid, 'tokens');
  const credDoc = await credsCol.doc(provider).get();

  if (!credDoc.exists) {
    throw new Error(`${PROVIDER_DESCRIPTIONS[provider]?.title || provider} is not connected. Authorization required.`);
  }

  const storedTokens = credDoc.data() as StoredTokens;
  if (!storedTokens.access_token && !storedTokens.refresh_token) {
    throw new Error('Valid credentials not found. Re-authorization required.');
  }

  const oauth2Client = await getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: storedTokens.access_token || undefined,
    refresh_token: storedTokens.refresh_token || undefined,
    expiry_date: storedTokens.expiry_date || undefined,
  });

  // Listen to automatic token refreshes by google-auth-library and update secure store
  oauth2Client.on('tokens', async (newTokens) => {
    const updated: StoredTokens = {
      ...storedTokens,
      access_token: newTokens.access_token || storedTokens.access_token,
      refresh_token: newTokens.refresh_token || storedTokens.refresh_token,
      expiry_date: newTokens.expiry_date || storedTokens.expiry_date,
      updatedAt: new Date().toISOString(),
    };
    await credsCol.doc(provider).set(updated, { merge: true });
  });

  return oauth2Client;
}

/**
 * Revokes provider authorization with Google and removes stored credentials.
 */
export async function revokeProviderConnection(
  uid: string,
  provider: SupportedProvider
): Promise<void> {
  const credsCol = getServerCredentialsSubcollection(uid, 'tokens');
  const credDoc = await credsCol.doc(provider).get();

  if (credDoc.exists) {
    const storedTokens = credDoc.data() as StoredTokens;
    const tokenToRevoke = storedTokens.refresh_token || storedTokens.access_token;
    if (tokenToRevoke) {
      try {
        const oauth2Client = await getOAuth2Client();
        await oauth2Client.revokeToken(tokenToRevoke);
      } catch (err: any) {
        console.warn(`[OAuth] Token revocation notice for ${provider}:`, err.message);
      }
    }
    await credsCol.doc(provider).delete();
  }

  // Delete sync state
  const syncCol = getServerCredentialsSubcollection(uid, 'sync');
  await syncCol.doc(provider).delete();

  // Mark connection as disconnected
  const userConnCol = getUserSubcollection(uid, 'connections');
  await userConnCol.doc(provider).set({
    id: provider,
    userId: uid,
    provider,
    status: 'disconnected',
    lastSyncAt: null,
    itemCount: 0,
    disconnectedAt: new Date().toISOString(),
  }, { merge: true });
}
