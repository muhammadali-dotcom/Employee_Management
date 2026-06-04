// ─────────────────────────────────────────────────────────────────────────────
// src/routes/employees.ts  —  EMPLOYEE ROUTES
//
// All routes are protected: require authentication + super_admin role.
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
import { authenticate }     from '../middleware/authenticate';
import { requireRole }      from '../middleware/requireRole';

const router = Router();

// All employee routes require a valid token AND super_admin role
router.use(authenticate, requireRole('super_admin'));

router.get('/',     getAllEmployees);
router.post('/',    validateEmployee, createEmployee);
router.get('/:id',  getEmployeeById);
router.put('/:id',  validateEmployee, updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
