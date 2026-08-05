import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { createLeaveType, deleteLeaveType, listLeaveTypes, updateLeaveType } from '../controllers/leaveTypes';

export const leaveTypesRouter = Router();

leaveTypesRouter.use(requireAuth);

leaveTypesRouter.get('/', listLeaveTypes);
leaveTypesRouter.post('/', requireRole('HR', 'ADMIN'), createLeaveType);
leaveTypesRouter.put('/:id', requireRole('HR', 'ADMIN'), updateLeaveType);
leaveTypesRouter.delete('/:id', requireRole('HR', 'ADMIN'), deleteLeaveType);
