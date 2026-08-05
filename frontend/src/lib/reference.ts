import { api } from './api';
import type { Department, LeavePolicySummary } from '../features/employees/types';

export interface LeaveType {
  id: string;
  name: string;
  isPaid: boolean;
  requiresApproval: boolean;
}

export interface LeavePolicyRule {
  id: string;
  leaveTypeId: string;
  leaveType: LeaveType;
  annualDays: number;
  accrualFrequency: 'MONTHLY' | 'ANNUAL' | 'NONE';
  maxCarryForward: number;
}

export interface LeavePolicy extends LeavePolicySummary {
  description: string | null;
  rules: LeavePolicyRule[];
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  location: string;
}

export const referenceApi = {
  departments: () => api.get<Department[]>('/departments'),
  leaveTypes: () => api.get<LeaveType[]>('/leave-types'),
  leavePolicies: () => api.get<LeavePolicy[]>('/leave-policies'),
  holidays: () => api.get<Holiday[]>('/holidays'),
};
