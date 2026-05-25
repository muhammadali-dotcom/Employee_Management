// ─────────────────────────────────────────────────────────────────────────────
// src/controllers/departmentController.ts  —  DEPARTMENT BUSINESS LOGIC
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response } from 'express';
import Department from '../models/Department';
import Employee from '../models/Employee';

// GET /api/departments
export async function getAllDepartments(req: Request, res: Response) {
  try {
    const departments = await Department.findAll({
      order: [['name', 'ASC']],
    });
    res.json(departments);
  } catch {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
}

// GET /api/departments/:id
export async function getDepartmentById(req: Request, res: Response) {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [{ model: Employee, as: 'employees' }],
    });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch {
    res.status(500).json({ error: 'Failed to fetch department' });
  }
}

// POST /api/departments
export async function createDepartment(req: Request, res: Response) {
  try {
    const department = await Department.create(req.body);
    res.status(201).json(department);
  } catch (error) {
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'A department with this name already exists' });
    }
    res.status(400).json({ error: 'Failed to create department' });
  }
}

// PUT /api/departments/:id
export async function updateDepartment(req: Request, res: Response) {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    await department.update(req.body);
    res.json(department);
  } catch (error) {
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'A department with this name already exists' });
    }
    res.status(400).json({ error: 'Failed to update department' });
  }
}

// DELETE /api/departments/:id
// Unassigns all employees from this department before deleting
export async function deleteDepartment(req: Request, res: Response) {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    // Set departmentId to null for all employees in this department
    await Employee.update(
      { departmentId: null },
      { where: { departmentId: req.params.id } }
    );
    await department.destroy();
    res.json({ message: 'Department deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete department' });
  }
}
