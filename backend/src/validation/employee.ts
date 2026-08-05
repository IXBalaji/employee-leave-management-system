import { z } from 'zod';

export const genderEnum = z.enum(['FEMALE', 'MALE', 'OTHER', 'PREFER_NOT_TO_SAY']);
export const maritalStatusEnum = z.enum(['SINGLE', 'MARRIED', 'OTHER']);
export const employmentTypeEnum = z.enum(['FULL_TIME', 'CONTRACT', 'INTERN']);
export const roleEnum = z.enum(['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN']);
export const employeeStatusEnum = z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE']);

const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const phonePattern = /^[+]?[\d\s-]{7,15}$/;

/** Fields an employee may edit on their own profile. */
export const selfEditableSchema = z.object({
  phone: z.string().regex(phonePattern, 'Enter a valid phone number.').optional().or(z.literal('')),
  currentAddress: z.string().max(300).optional().or(z.literal('')),
  permanentAddress: z.string().max(300).optional().or(z.literal('')),
  emergencyContactName: z.string().min(1, 'Enter a name.').optional().or(z.literal('')),
  emergencyContactRelationship: z.string().min(1, 'Enter a relationship.').optional().or(z.literal('')),
  emergencyContactPhone: z.string().regex(phonePattern, 'Enter a valid phone number.').optional().or(z.literal('')),
  bankName: z.string().max(120).optional().or(z.literal('')),
  bankAccountNumber: z.string().max(34).optional().or(z.literal('')),
  bankIfsc: z
    .string()
    .regex(ifscPattern, 'Enter a valid IFSC code, like SBIN0001234.')
    .optional()
    .or(z.literal('')),
});

/** Full record — what HR/Admin can create or edit. */
export const employeeSchema = selfEditableSchema.extend({
  firstName: z.string({ error: 'Enter a first name.' }).min(1, 'Enter a first name.').max(80),
  lastName: z.string({ error: 'Enter a last name.' }).min(1, 'Enter a last name.').max(80),
  photoUrl: z.string().url('Enter a valid URL.').optional().or(z.literal('')),
  dob: z.string().date().optional().or(z.literal('')),
  gender: genderEnum.optional().or(z.literal('')),
  bloodGroup: z.string().max(5).optional().or(z.literal('')),
  maritalStatus: maritalStatusEnum.optional().or(z.literal('')),

  personalEmail: z.string().email('Enter a valid email address, like name@company.com.').optional().or(z.literal('')),
  workEmail: z.string({ error: 'Enter a valid email address, like name@company.com.' }).email(
    'Enter a valid email address, like name@company.com.',
  ),

  departmentId: z.string({ error: 'Select a department.' }).min(1, 'Select a department.'),
  designation: z.string({ error: 'Enter a designation.' }).min(1, 'Enter a designation.').max(120),
  employmentType: employmentTypeEnum,
  workLocation: z.string().max(120).optional().or(z.literal('')),
  dateOfJoining: z.string({ error: 'Enter a date of joining.' }).date('Enter a valid date.'),
  reportingManagerId: z.string().optional().or(z.literal('')),

  govIdNumber: z.string().max(40).optional().or(z.literal('')),

  leavePolicyId: z.string().optional().or(z.literal('')),
  role: roleEnum.default('EMPLOYEE'),
  status: employeeStatusEnum.default('ACTIVE'),
});

export const employeeCreateSchema = employeeSchema.extend({
  password: z.string({ error: 'Set a password.' }).min(8, 'Use at least 8 characters.'),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
