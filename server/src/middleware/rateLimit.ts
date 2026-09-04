import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const userRequestMap = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_AI_REQUESTS_PER_MINUTE = 30;

/**
 * Enforces per-user rate limiting on generative AI endpoints.
 * Prevents runaway budget exhaustion and replay attacks.
 */
export function aiRateLimiter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const uid = req.user?.uid || req.ip || 'anonymous';
  const now = Date.now();

  const record = userRequestMap.get(uid);

  if (!record || now > record.resetTime) {
    userRequestMap.set(uid, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    next();
    return;
  }

  if (record.count >= MAX_AI_REQUESTS_PER_MINUTE) {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many reflection or chat requests. Please slow down and try again shortly.',
      },
    });
    return;
  }

  record.count += 1;
  next();
}

/**
 * Validates text payload sizes to prevent Denial of Service or excessive token charges.
 */
export function validatePayloadSize(maxChars: number = 10000) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const textContent = req.body?.content || req.body?.message || '';
    if (typeof textContent === 'string' && textContent.length > maxChars) {
      res.status(400).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Input exceeds the maximum allowed length of ${maxChars} characters.`,
        },
      });
      return;
    }
    next();
  };
}
