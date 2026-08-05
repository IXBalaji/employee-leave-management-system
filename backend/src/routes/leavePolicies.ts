import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  createLeavePolicy,
  deleteLeavePolicy,
  listLeavePolicies,
  updateLeavePolicy,
} from '../controllers/leavePolicies';

export const leavePoliciesRouter = Router();

leavePoliciesRouter.use(requireAuth);

leavePoliciesRouter.get('/', listLeavePolicies);
leavePoliciesRouter.post('/', requireRole('HR', 'ADMIN'), createLeavePolicy);
leavePoliciesRouter.put('/:id', requireRole('HR', 'ADMIN'), updateLeavePolicy);
leavePoliciesRouter.delete('/:id', requireRole('HR', 'ADMIN'), deleteLeavePolicy);
