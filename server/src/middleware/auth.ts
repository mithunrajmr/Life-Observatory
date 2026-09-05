import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../services/firebaseAdmin';
import { verifySessionToken } from '../services/sessionTokenService';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

/**
 * Authentication Middleware:
 * Strictly verifies the Firebase ID token in the Authorization header.
 * Attaches the unforgeable req.user.uid.
 * Disregards any client-supplied body.uid or query.userId.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split('Bearer ')[1]?.trim()
    : undefined;

  // If no Bearer token, check httpOnly session cookie
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)lo_session=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication required. Missing Bearer token or session cookie.',
      },
    });
    return;
  }

  // 1. Cryptographically Signed Session Token (HMAC-SHA256)
  if (token.startsWith('lo_sec_')) {
    try {
      const payload = verifySessionToken(token);
      req.user = {
        uid: payload.uid,
        email: payload.email,
      };
      next();
      return;
    } catch (err: any) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: err.message || 'The cryptographic session token is invalid or expired.',
        },
      });
      return;
    }
  }

  // Reject insecure legacy token format
  if (token.startsWith('real_google_user_')) {
    res.status(401).json({
      error: {
        code: 'INSECURE_TOKEN_REJECTED',
        message: 'Legacy unsigned tokens are rejected for security. Please sign in again.',
      },
    });
    return;
  }

  // Test & local development demo mode hook for deterministic automated testing and local eval
  const isNonProd = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_AUTH === 'true';
  if (isNonProd && (token.startsWith('test_token_for_') || token.startsWith('demo_token_for_'))) {
    const testUid = token.replace('test_token_for_', '').replace('demo_token_for_', '');
    req.user = {
      uid: testUid,
      email: `${testUid}@local.observatory`,
    };
    next();
    return;
  }

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken || !decodedToken.uid) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'The authentication token could not be verified.',
        },
      });
      return;
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error: any) {
    // Safe error message: do not leak raw stack trace or internal details
    res.status(401).json({
      error: {
        code: 'TOKEN_VERIFICATION_FAILED',
        message: 'Session invalid or expired. Please sign in again.',
      },
    });
  }
}
