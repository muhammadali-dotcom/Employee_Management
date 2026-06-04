// ─────────────────────────────────────────────────────────────────────────────
// src/routes/auth.ts  —  AUTH ROUTES
//
// Base path: /api/auth  (set in src/index.ts)
//
// Public routes (no token required):
//   POST /api/auth/login
//   POST /api/auth/refresh
//   POST /api/auth/logout
//
// Protected routes:
//   POST /api/auth/set-password  (super_admin only)
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { login, refresh, logout, setPassword } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';
import { requireRole }  from '../middleware/requireRole';

const router = Router();

router.post('/login',        login);
router.post('/refresh',      refresh);
router.post('/logout',       logout);
router.post('/set-password', authenticate, requireRole('super_admin'), setPassword);

export default router;
