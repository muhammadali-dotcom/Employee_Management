// ─────────────────────────────────────────────────────────────────────────────
// src/middleware/notFound.ts  —  404 HANDLER
//
// If a request reaches this middleware, no route matched.
// Register this AFTER all routes in src/index.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
