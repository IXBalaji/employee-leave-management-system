import { api } from '../../lib/api';
import type { Department } from '../employees/types';
import type { Holiday, LeavePolicy, LeaveType } from '../../lib/reference';

export const adminApi = {
  createDepartment: (data: { name: string; headEmployeeId?: string }) => api.post<Department>('/departments', data),
  updateDepartment: (id: string, data: { name: string; headEmployeeId?: string }) =>
    api.put<Department>(`/departments/${id}`, data),
  deleteDepartment: (id: string) => api.delete<void>(`/departments/${id}`),

  createHoliday: (data: { name: string; date: string; location?: string }) => api.post<Holiday>('/holidays', data),
  deleteHoliday: (id: string) => api.delete<void>(`/holidays/${id}`),

  createLeaveType: (data: { name: string; isPaid: boolean; requiresApproval: boolean }) =>
    api.post<LeaveType>('/leave-types', data),
  deleteLeaveType: (id: string) => api.delete<void>(`/leave-types/${id}`),

  createLeavePolicy: (data: unknown) => api.post<LeavePolicy>('/leave-policies', data),
  updateLeavePolicy: (id: string, data: unknown) => api.put<LeavePolicy>(`/leave-policies/${id}`, data),
  deleteLeavePolicy: (id: string) => api.delete<void>(`/leave-policies/${id}`),
};
