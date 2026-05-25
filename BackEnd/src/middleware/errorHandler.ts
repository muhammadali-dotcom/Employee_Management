// ─────────────────────────────────────────────────────────────────────────────
// src/middleware/errorHandler.ts  —  GLOBAL ERROR HANDLER
//
// This middleware catches any unhandled errors in the app.
// It must be registered LAST in src/index.ts (after all routes).
// Express knows it's an error handler because it has 4 parameters (err, req, res, next).
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction   // must be here even if unused — Express requires 4 params
) {
  console.error('Unhandled error:', err.message);

  // Don't expose internal error details in production
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(500).json({
    error:   'Internal server error',
    message: isDev ? err.message : 'Something went wrong',
    stack:   isDev ? err.stack   : undefined,
  });
}
