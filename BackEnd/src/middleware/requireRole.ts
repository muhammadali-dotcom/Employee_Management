// ─────────────────────────────────────────────────────────────────────────────
// src/middleware/requireRole.ts  —  ROLE-BASED ACCESS CONTROL
//
// Must be used AFTER authenticate middleware (requires req.user to be set).
//
// Usage:  router.post('/admin-only', authenticate, requireRole('super_admin'), handler)
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

export const requireRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (req.user.role !== role) {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}
