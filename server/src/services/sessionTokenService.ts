import crypto from 'crypto';
import { ENV } from '../config/env';

interface SessionPayload {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  iat: number;
  exp: number;
}

function getSigningSecret(): string {
  return (
    ENV.GOOGLE_CLIENT_SECRET ||
    process.env.SESSION_SECRET ||
    'life-observatory-secure-signing-key-production'
  );
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 * Prevents identity forgery or client-side tampering.
 */
export function createSessionToken(user: {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  durationMs?: number;
}): string {
  if (!user.uid) {
    throw new Error('Cannot create session token without a valid UID');
  }

  const now = Date.now();
  const duration = user.durationMs || 86400000 * 30; // 30 days default

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: SessionPayload = {
    uid: user.uid,
    email: user.email,
    name: user.name,
    picture: user.picture,
    iat: now,
    exp: now + duration,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(signatureInput)
    .digest('base64url');

  return `lo_sec_${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 session token.
 * Uses timingSafeEqual to guard against timing attacks.
 * Throws an error if the signature is invalid or the token has expired.
 */
export function verifySessionToken(token: string): SessionPayload {
  if (!token.startsWith('lo_sec_')) {
    // Backward compatibility check during active migration
    if (token.startsWith('real_google_user_')) {
      throw new Error('Insecure legacy token format rejected. Re-authentication required.');
    }
    throw new Error('Malformed session token prefix.');
  }

  const raw = token.replace('lo_sec_', '');
  const parts = raw.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed token structure.');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(signatureInput)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf-8');
  const expectedBuf = Buffer.from(expectedSignature, 'utf-8');

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error('Cryptographic signature verification failed.');
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
  } catch {
    throw new Error('Token payload could not be parsed.');
  }

  if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
    throw new Error('Session token has expired.');
  }

  if (!payload.uid || typeof payload.uid !== 'string') {
    throw new Error('Token payload missing valid UID.');
  }

  return payload;
}
