import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { ENV } from './env';

let cachedGeminiApiKey: string | null = null;

/**
 * Resolves the Gemini API Key according to the strict environment security rule:
 * - Production Cloud Run MUST use Google Cloud Secret Manager. No silent env-var fallback.
 * - Local development uses explicit local secret mechanism (ENV.LOCAL_GEMINI_API_KEY).
 * - Secrets are never exposed to browser, never logged, never committed.
 */
export async function getGeminiApiKey(): Promise<string> {
  if (cachedGeminiApiKey) {
    return cachedGeminiApiKey;
  }

  if (ENV.isProduction) {
    // Production Cloud Run path: Secret Manager is mandatory
    if (!ENV.GCP_PROJECT_ID) {
      throw new Error(
        'Production configuration error: GCP_PROJECT_ID could not be determined for Secret Manager access.'
      );
    }

    try {
      const client = new SecretManagerServiceClient();
      const name = `projects/${ENV.GCP_PROJECT_ID}/secrets/${ENV.SECRET_NAME_GEMINI_KEY}/versions/latest`;
      
      const [version] = await client.accessSecretVersion({ name });
      const payload = version.payload?.data?.toString();

      if (!payload) {
        throw new Error(`Secret ${ENV.SECRET_NAME_GEMINI_KEY} returned an empty payload from Secret Manager.`);
      }

      cachedGeminiApiKey = payload.trim();
      return cachedGeminiApiKey;
    } catch (err: any) {
      // Safe error logging: do NOT leak secret or internal tokens
      console.error('[Security] Failed to access Secret Manager in production:', err?.message || 'Unknown error');
      throw new Error('Could not retrieve API credentials from Secret Manager in production environment.');
    }
  } else {
    // Local development path
    if (ENV.LOCAL_GEMINI_API_KEY) {
      cachedGeminiApiKey = ENV.LOCAL_GEMINI_API_KEY.trim();
      return cachedGeminiApiKey;
    }

    // Try reading Secret Manager in local dev if GCP_PROJECT_ID is present and user is logged into gcloud
    if (ENV.GCP_PROJECT_ID) {
      try {
        const client = new SecretManagerServiceClient();
        const name = `projects/${ENV.GCP_PROJECT_ID}/secrets/${ENV.SECRET_NAME_GEMINI_KEY}/versions/latest`;
        const [version] = await client.accessSecretVersion({ name });
        const payload = version.payload?.data?.toString();
        if (payload) {
          cachedGeminiApiKey = payload.trim();
          return cachedGeminiApiKey;
        }
      } catch {
        // Fallback gracefully in local dev
      }
    }

    // If neither is present in local dev
    return '';
  }
}
