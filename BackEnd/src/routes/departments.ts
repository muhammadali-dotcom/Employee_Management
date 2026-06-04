// ─────────────────────────────────────────────────────────────────────────────
// src/routes/departments.ts  —  DEPARTMENT ROUTES
//
// All routes are protected: require authentication + super_admin role.
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
import { authenticate }       from '../middleware/authenticate';
import { requireRole }        from '../middleware/requireRole';

const router = Router();

// All department routes require a valid token AND super_admin role
router.use(authenticate, requireRole('super_admin'));

router.get('/',       getAllDepartments);
router.post('/',      validateDepartment, createDepartment);
router.get('/:id',    getDepartmentById);
router.put('/:id',    validateDepartment, updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
