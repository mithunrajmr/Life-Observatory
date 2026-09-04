import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '8080', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Google Cloud Project resolution (dynamic, portable, no hardcoded values)
  GCP_PROJECT_ID: 
    process.env.GCP_PROJECT_ID || 
    process.env.GOOGLE_CLOUD_PROJECT || 
    process.env.GCLOUD_PROJECT || 
    undefined,

  // Gemini models per current Google documentation
  CONVERSATION_MODEL: process.env.CONVERSATION_MODEL || 'gemini-2.5-flash',
  EXTRACTION_MODEL: process.env.EXTRACTION_MODEL || 'gemini-2.5-flash-lite',
  INSIGHT_MODEL: process.env.INSIGHT_MODEL || 'gemini-2.5-flash',

  // Secret name in Secret Manager
  SECRET_NAME_GEMINI_KEY: process.env.SECRET_NAME_GEMINI_KEY || 'GEMINI_API_KEY',

  // Local development API key (strictly local fallback)
  LOCAL_GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',

  // Client static assets path when serving combined container
  CLIENT_DIST_PATH: process.env.CLIENT_DIST_PATH || '../client/dist',
};
