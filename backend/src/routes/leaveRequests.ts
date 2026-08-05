import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  applyForLeave,
  cancelLeaveRequest,
  decideLeaveRequest,
  listApprovalQueue,
  listMyBalances,
  listMyLeaveRequests,
} from '../controllers/leaveRequests';

export const leaveRequestsRouter = Router();

leaveRequestsRouter.use(requireAuth);

leaveRequestsRouter.get('/mine', listMyLeaveRequests);
leaveRequestsRouter.get('/balances', listMyBalances);
leaveRequestsRouter.get('/approvals', requireRole('MANAGER', 'HR', 'ADMIN'), listApprovalQueue);
leaveRequestsRouter.post('/', applyForLeave);
leaveRequestsRouter.post('/:id/decision', requireRole('MANAGER', 'HR', 'ADMIN'), decideLeaveRequest);
leaveRequestsRouter.post('/:id/cancel', cancelLeaveRequest);
