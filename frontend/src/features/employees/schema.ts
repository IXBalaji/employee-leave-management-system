import { z } from 'zod';

export const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

export const MARITAL_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'OTHER', label: 'Other' },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Intern' },
];

export const ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'HR', label: 'HR' },
  { value: 'ADMIN', label: 'Admin' },
];

export const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const phonePattern = /^[+]?[\d\s-]{7,15}$/;

const optionalText = (max: number) => z.string().max(max).optional().or(z.literal(''));

/** Fields an employee may edit on their own profile — mirrors backend selfEditableSchema. */
export const selfEditableFields = {
  phone: z.string().regex(phonePattern, 'Enter a valid phone number.').optional().or(z.literal('')),
  currentAddress: optionalText(300),
  permanentAddress: optionalText(300),
  emergencyContactName: z.string().min(1, 'Enter a name.').optional().or(z.literal('')),
  emergencyContactRelationship: z.string().min(1, 'Enter a relationship.').optional().or(z.literal('')),
  emergencyContactPhone: z.string().regex(phonePattern, 'Enter a valid phone number.').optional().or(z.literal('')),
  bankName: optionalText(120),
  bankAccountNumber: optionalText(34),
  bankIfsc: z.string().regex(ifscPattern, 'Enter a valid IFSC code, like SBIN0001234.').optional().or(z.literal('')),
};

export const employeeFormSchema = z.object({
  ...selfEditableFields,
  firstName: z.string().min(1, 'Enter a first name.').max(80),
  lastName: z.string().min(1, 'Enter a last name.').max(80),
  photoUrl: z.string().url('Enter a valid URL.').optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  bloodGroup: optionalText(5),
  maritalStatus: z.string().optional().or(z.literal('')),

  personalEmail: z.string().email('Enter a valid email address, like name@company.com.').optional().or(z.literal('')),
  workEmail: z.string().min(1, 'Enter a work email.').email('Enter a valid email address, like name@company.com.'),

  departmentId: z.string().min(1, 'Select a department.'),
  designation: z.string().min(1, 'Enter a designation.').max(120),
  employmentType: z.string().min(1, 'Select an employment type.'),
  workLocation: optionalText(120),
  dateOfJoining: z.string().min(1, 'Enter a date of joining.'),
  reportingManagerId: z.string().optional().or(z.literal('')),

  govIdNumber: optionalText(40),

  leavePolicyId: z.string().optional().or(z.literal('')),
  role: z.string().min(1, 'Select a role.'),
  status: z.string().min(1, 'Select a status.'),

  password: z.string().optional().or(z.literal('')),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

/** Create mode requires a password (min 8 chars); edit mode leaves it untouched. */
export function buildEmployeeFormSchema(requirePassword: boolean) {
  return employeeFormSchema.superRefine((data, ctx) => {
    if (requirePassword && (!data.password || data.password.length < 8)) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'Use at least 8 characters.' });
    }
  });
}
