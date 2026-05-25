// ─────────────────────────────────────────────────────────────────────────────
// src/controllers/attendanceController.ts  —  ATTENDANCE BUSINESS LOGIC
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Attendance from '../models/Attendance';
import Employee from '../models/Employee';

// GET /api/attendance?month=2026-05
// Returns all attendance records, optionally filtered by month
export async function getAllAttendance(req: Request, res: Response) {
  try {
    const { month, employeeId } = req.query;

    const where: Record<string, unknown> = {};

    // Filter by month if provided (e.g. ?month=2026-05)
    if (month) {
      where.date = {
        [Op.like]: `${month}%`,  // matches all dates starting with "2026-05"
      };
    }

    // Filter by employee if provided
    if (employeeId) {
      where.employeeId = employeeId;
    }

    const records = await Attendance.findAll({
      where,
      include: [{ model: Employee, as: 'employee' }],
      order:   [['date', 'ASC']],
    });
    res.json(records);
  } catch {
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
}

// POST /api/attendance
// Creates or updates an attendance record (upsert)
// One record per employee per date — if it exists, update it
export async function upsertAttendance(req: Request, res: Response) {
  try {
    const { employeeId, date, status, checkIn, checkOut, note } = req.body;

    // upsert = update if exists, insert if not
    const [record, created] = await Attendance.upsert({
      employeeId,
      date,
      status,
      checkIn:  checkIn  || null,
      checkOut: checkOut || null,
      note:     note     || null,
    });

    res.status(created ? 201 : 200).json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: 'Failed to save attendance record', details: message });
  }
}

// DELETE /api/attendance/:id
export async function deleteAttendance(req: Request, res: Response) {
  try {
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
