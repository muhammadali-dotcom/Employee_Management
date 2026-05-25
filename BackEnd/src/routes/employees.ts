// ─────────────────────────────────────────────────────────────────────────────
// src/routes/employees.ts  —  EMPLOYEE ROUTES
//
// Defines which URL + HTTP method maps to which controller function.
// Think of routes as a traffic director — they receive the request
// and hand it off to the right controller function.
//
// Base path: /api/employees  (set in src/index.ts)
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController';
import { validateEmployee } from '../middleware/validate';

const router = Router();

// GET    /api/employees          → get all employees
// POST   /api/employees          → create a new employee
// GET    /api/employees/:id      → get one employee by id
// PUT    /api/employees/:id      → update an employee
// DELETE /api/employees/:id      → delete an employee

router.get('/',     getAllEmployees);
router.post('/',    validateEmployee, createEmployee);
router.get('/:id',  getEmployeeById);
router.put('/:id',  validateEmployee, updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
