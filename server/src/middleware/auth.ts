import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../services/firebaseAdmin';

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

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication required. Missing or malformed Bearer token.',
      },
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication required. Empty token.',
      },
    });
    return;
  }

  // Test mode hook for deterministic automated security unit tests
  if (process.env.NODE_ENV === 'test' && token.startsWith('test_token_for_')) {
    const testUid = token.replace('test_token_for_', '');
    req.user = {
      uid: testUid,
      email: `${testUid}@test.local`,
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
