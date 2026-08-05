import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  createEmployee,
  getEmployee,
  listEmployees,
  listMyTeam,
  updateEmployee,
} from '../controllers/employees';

export const employeesRouter = Router();

employeesRouter.use(requireAuth);

employeesRouter.get('/', requireRole('HR', 'ADMIN'), listEmployees);
employeesRouter.get('/team', requireRole('MANAGER', 'HR', 'ADMIN'), listMyTeam);
employeesRouter.post('/', requireRole('HR', 'ADMIN'), createEmployee);
employeesRouter.get('/:id', getEmployee);
employeesRouter.put('/:id', updateEmployee);
