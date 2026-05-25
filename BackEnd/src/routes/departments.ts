// ─────────────────────────────────────────────────────────────────────────────
// src/routes/departments.ts  —  DEPARTMENT ROUTES
//
// Base path: /api/departments  (set in src/index.ts)
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController';
import { validateDepartment } from '../middleware/validate';

const router = Router();

// GET    /api/departments         → get all departments
// POST   /api/departments         → create a new department
// GET    /api/departments/:id     → get one department (with its employees)
// PUT    /api/departments/:id     → rename/update a department
// DELETE /api/departments/:id     → delete a department (unassigns employees)

router.get('/',       getAllDepartments);
router.post('/',      validateDepartment, createDepartment);
router.get('/:id',    getDepartmentById);
router.put('/:id',    validateDepartment, updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
