// ─────────────────────────────────────────────────────────────────────────────
// src/controllers/attendanceController.ts  —  ATTENDANCE BUSINESS LOGIC
//
// Role-based access rules:
//   - super_admin: full read/write/delete access
//   - employee: can only read/write their own records; cannot delete
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Attendance from '../models/Attendance';
import Employee from '../models/Employee';

// GET /api/attendance?month=2026-06&employeeId=xxx
// super_admin → returns all records (filtered by query params if provided)
// employee    → always filtered to their own records only
export async function getAllAttendance(req: Request, res: Response) {
  try {
    const { month, employeeId } = req.query;
    const user = req.user!;

    const where: Record<string, unknown> = {};

    // Employees can only see their own records
    if (user.role === 'employee') {
      where.employeeId = user.id;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    // Filter by month using DATE_TRUNC / range instead of LIKE —
    // PostgreSQL stores DATEONLY as a real DATE column, LIKE doesn't work on it.
    if (month && typeof month === 'string') {
      const [yyyy, mm] = month.split('-');
      if (yyyy && mm) {
        const startDate = `${yyyy}-${mm.padStart(2, '0')}-01`;
        // Last day: go to first of next month then subtract 1 day
        const nextMonth = parseInt(mm, 10) === 12
          ? `${parseInt(yyyy, 10) + 1}-01-01`
          : `${yyyy}-${String(parseInt(mm, 10) + 1).padStart(2, '0')}-01`;
        where.date = { [Op.gte]: startDate, [Op.lt]: nextMonth };
      }
    }

    const records = await Attendance.findAll({
      where,
      include: [{ model: Employee, as: 'employee', attributes: { exclude: ['passwordHash'] } }],
      order:   [['date', 'ASC']],
    });
    res.json(records);
  } catch (err) {
    console.error('getAllAttendance error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
}

// POST /api/attendance
// Employees can only submit attendance for themselves
export async function upsertAttendance(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { employeeId, date, status, checkIn, checkOut, note } = req.body;

    // Employees cannot mark attendance for others
    if (user.role === 'employee' && employeeId !== user.id) {
      res.status(403).json({ error: 'Forbidden: you can only mark your own attendance' });
      return;
    }

    // Use findOrCreate + update instead of upsert — Sequelize upsert on
    // PostgreSQL uses the primary key, not the unique (employeeId, date) index.
    const existing = await Attendance.findOne({ where: { employeeId, date } });

    let record: Attendance;
    if (existing) {
      await existing.update({
        status,
        checkIn:  checkIn  ?? null,
        checkOut: checkOut ?? null,
        note:     note     ?? null,
      });
      record = existing;
      res.status(200).json(record);
    } else {
      record = await Attendance.create({
        employeeId,
        date,
        status,
        checkIn:  checkIn  ?? null,
        checkOut: checkOut ?? null,
        note:     note     ?? null,
      });
      res.status(201).json(record);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: 'Failed to save attendance record', details: message });
  }
}

// DELETE /api/attendance/:id
// Only super_admin can delete records
export async function deleteAttendance(req: Request, res: Response) {
  try {
    const user = req.user!;

    if (user.role === 'employee') {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }

    const record = await Attendance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    await record.destroy();
    res.json({ message: 'Attendance record deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
}
