import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');

  // Safe logging: log route, status, and code, never leaking sensitive auth tokens or personal texts
  const safeLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode,
    code: errorCode,
    message: err.message,
  };
  console.error('[API Safe Diagnostics]', JSON.stringify(safeLog));

  // User-facing safe error message
  const userMessage = statusCode === 500
    ? 'An unexpected error occurred while processing your request. Please try again later.'
    : err.message || 'Invalid request.';

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: userMessage,
    },
  });
}
