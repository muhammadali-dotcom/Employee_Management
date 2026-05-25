// ─────────────────────────────────────────────────────────────────────────────
// src/routes/attendance.ts  —  ATTENDANCE ROUTES
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

const router = Router();

// GET    /api/attendance              → get all records (supports ?month=2026-05 and ?employeeId=xxx)
// POST   /api/attendance              → create or update a record (upsert)
// DELETE /api/attendance/:id          → delete a specific record

router.get('/',       getAllAttendance);
router.post('/',      validateAttendance, upsertAttendance);
router.delete('/:id', deleteAttendance);

export default router;
