export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type HalfDaySession = 'FIRST_HALF' | 'SECOND_HALF';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveType: { id: string; name: string; isPaid: boolean; requiresApproval: boolean };
  employee: { id: string; firstName: string; lastName: string; employeeCode: string };
  approver: { id: string; firstName: string; lastName: string } | null;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDaySession: HalfDaySession | null;
  reason: string;
  status: LeaveRequestStatus;
  approverComments: string | null;
  appliedAt: string;
  decidedAt: string | null;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveType: { id: string; name: string; isPaid: boolean; requiresApproval: boolean };
  year: number;
  allocated: number;
  used: number;
}
