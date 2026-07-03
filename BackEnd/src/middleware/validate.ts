// ─────────────────────────────────────────────────────────────────────────────
// src/middleware/validate.ts  —  REQUEST VALIDATION MIDDLEWARE
//
// Middleware runs BEFORE the controller function.
// It checks if the request body has the required fields.
// If validation fails → sends a 400 error immediately (controller never runs).
// If validation passes → calls next() to continue to the controller.
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';

const NAME_PATTERN = /^[A-Za-z\s'-]+$/;
const JOIN_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_PATTERN = /^[0-9+\-\s()]+$/;

// ── Employee validation ───────────────────────────────────────────────────────
export const validateEmployee = (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, phone, role, joinDate } = req.body;
  const errors: string[] = [];

  if (!firstName?.trim()) {
    errors.push('firstName is required');
  } else if (!NAME_PATTERN.test(firstName.trim())) {
    errors.push('firstName must contain only letters');
  }

  if (!lastName?.trim()) {
    errors.push('lastName is required');
  } else if (!NAME_PATTERN.test(lastName.trim())) {
    errors.push('lastName must contain only letters');
  }

  if (!role?.trim()) errors.push('role is required');

  if (!joinDate?.trim()) {
    errors.push('joinDate is required');
  } else if (!JOIN_DATE_PATTERN.test(joinDate.trim())) {
    errors.push('joinDate must be in YYYY-MM-DD format');
  }

  if (!email?.trim()) {
    errors.push('email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('email must be a valid email address');
  }

  if (phone?.trim()) {
    const digitsOnly = phone.replace(/\D/g, '');
    if (!PHONE_PATTERN.test(phone)) {
      errors.push('phone must contain only digits');
    } else if (digitsOnly.length < 7) {
      errors.push('phone is too short');
    } else if (digitsOnly.length > 15) {
      errors.push('phone is too long');
    }
  }

  if (errors.length > 0) {
    // Stop here — send error response, controller never runs
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // All good — pass control to the next function (the controller)
  next();
}

// ── Department validation ─────────────────────────────────────────────────────
export const validateDepartment = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  const errors: string[] = [];

  if (!name?.trim()) errors.push('name is required');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}

// ── Attendance validation ─────────────────────────────────────────────────────
export const validateAttendance = (req: Request, res: Response, next: NextFunction) => {
  const { employeeId, date, status } = req.body;
  const errors: string[] = [];

  const validStatuses = ['present', 'absent', 'on_leave', 'on_break', 'late'];

  if (!employeeId?.trim()) errors.push('employeeId is required');
  if (!date?.trim())       errors.push('date is required');
  if (!status?.trim()) {
    errors.push('status is required');
  } else if (!validStatuses.includes(status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}
