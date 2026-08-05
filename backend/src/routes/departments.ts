import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { createDepartment, deleteDepartment, listDepartments, updateDepartment } from '../controllers/departments';

export const departmentsRouter = Router();

departmentsRouter.use(requireAuth);

departmentsRouter.get('/', listDepartments);
departmentsRouter.post('/', requireRole('HR', 'ADMIN'), createDepartment);
departmentsRouter.put('/:id', requireRole('HR', 'ADMIN'), updateDepartment);
departmentsRouter.delete('/:id', requireRole('HR', 'ADMIN'), deleteDepartment);
