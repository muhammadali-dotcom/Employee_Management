// ─────────────────────────────────────────────────────────────────────────────
// src/routes/attendance.ts  —  ATTENDANCE ROUTES
//
// All routes require authentication. Role-based rules are enforced in the
// controller (employees can only read/write their own records; only
// super_admin can delete records).
//
// Base path: /api/attendance  (set in src/index.ts)
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import {
  getAllAttendance,
  upsertAttendance,
  deleteAttendance,
} from '../controllers/attendanceController';
import { validateAttendance } from '../middleware/validate';
import { authenticate }       from '../middleware/authenticate';

const router = Router();

// All attendance routes require a valid access token
router.use(authenticate);

// GET    /api/attendance              → all records (super_admin) or own records (employee)
// POST   /api/attendance              → upsert; employee can only write own record
// DELETE /api/attendance/:id          → super_admin only

router.get('/',       getAllAttendance);
router.post('/',      validateAttendance, upsertAttendance);
router.delete('/:id', deleteAttendance);

export default router;
