import { api } from '../../lib/api';
import type { LeaveBalance, LeaveRequest } from './types';

export interface LeaveApplyPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDaySession?: string;
  reason: string;
}

export const leaveApi = {
  mine: () => api.get<LeaveRequest[]>('/leave-requests/mine'),
  balances: () => api.get<LeaveBalance[]>('/leave-requests/balances'),
  approvals: () => api.get<LeaveRequest[]>('/leave-requests/approvals'),
  apply: (data: LeaveApplyPayload) => api.post<LeaveRequest>('/leave-requests', data),
  decide: (id: string, status: 'APPROVED' | 'REJECTED', approverComments?: string) =>
    api.post<LeaveRequest>(`/leave-requests/${id}/decision`, { status, approverComments }),
  cancel: (id: string) => api.post<LeaveRequest>(`/leave-requests/${id}/cancel`),
};
