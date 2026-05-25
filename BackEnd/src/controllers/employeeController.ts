// ─────────────────────────────────────────────────────────────────────────────
// src/controllers/employeeController.ts  —  EMPLOYEE BUSINESS LOGIC
//
// Controllers contain the actual logic for each API endpoint.
// Routes call these functions. Keeping logic here keeps routes clean.
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response } from 'express';
import Employee from '../models/Employee';
import Department from '../models/Department';
import Attendance from '../models/Attendance';

// GET /api/employees
// Returns all employees, each with their department info included
export async function getAllEmployees(req: Request, res: Response) {
  try {
    const employees = await Employee.findAll({
      include: [{ model: Department, as: 'department' }],
      order:   [['createdAt', 'DESC']],
    });
    res.json(employees);
  } catch {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
}

// GET /api/employees/:id
// Returns one employee by their ID
export async function getEmployeeById(req: Request, res: Response) {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: Department, as: 'department' }],
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
}

// POST /api/employees
// Creates a new employee
export async function createEmployee(req: Request, res: Response) {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Handle duplicate email error
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'An employee with this email already exists' });
    }
    res.status(400).json({ error: 'Failed to create employee', details: message });
  }
}

// PUT /api/employees/:id
// Updates an existing employee
export async function updateEmployee(req: Request, res: Response) {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    await employee.update(req.body);
    res.json(employee);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: 'Failed to update employee', details: message });
  }
}

// DELETE /api/employees/:id
// Deletes an employee and all their attendance records
export async function deleteEmployee(req: Request, res: Response) {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    // Delete attendance records first (foreign key constraint)
    await Attendance.destroy({ where: { employeeId: req.params.id } });
    await employee.destroy();
    res.json({ message: 'Employee deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
}
