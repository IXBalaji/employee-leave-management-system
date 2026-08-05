export type Gender = 'FEMALE' | 'MALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'OTHER';
export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'INTERN';
export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN';
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

export interface Department {
  id: string;
  name: string;
  headEmployeeId: string | null;
}

export interface LeavePolicySummary {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  dob: string | null;
  gender: Gender | null;
  bloodGroup: string | null;
  maritalStatus: MaritalStatus | null;
  personalEmail: string | null;
  workEmail: string;
  phone: string | null;
  currentAddress: string | null;
  permanentAddress: string | null;
  departmentId: string | null;
  department: { id: string; name: string } | null;
  designation: string | null;
  employmentType: EmploymentType;
  workLocation: string | null;
  dateOfJoining: string | null;
  reportingManagerId: string | null;
  reportingManager: { id: string; firstName: string; lastName: string } | null;
  govIdNumber: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  emergencyContactName: string | null;
  emergencyContactRelationship: string | null;
  emergencyContactPhone: string | null;
  leavePolicyId: string | null;
  role: Role;
  status: EmployeeStatus;
  createdAt: string;
}
