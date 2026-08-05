import { z } from 'zod';

export const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, 'Select a leave type.'),
  startDate: z.string().date('Enter a valid start date.'),
  endDate: z.string().date('Enter a valid end date.'),
  isHalfDay: z.boolean().default(false),
  halfDaySession: z.enum(['FIRST_HALF', 'SECOND_HALF']).optional(),
  reason: z.string().min(1, 'Tell your manager why you need this leave.').max(500),
});

export const leaveDecisionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  approverComments: z.string().max(500).optional().or(z.literal('')),
});

export const leaveTypeSchema = z.object({
  name: z.string().min(1, 'Enter a name.').max(60),
  isPaid: z.boolean().default(true),
  requiresApproval: z.boolean().default(true),
});

export const leavePolicySchema = z.object({
  name: z.string().min(1, 'Enter a name.').max(60),
  description: z.string().max(300).optional().or(z.literal('')),
  rules: z
    .array(
      z.object({
        leaveTypeId: z.string().min(1),
        annualDays: z.number().min(0),
        accrualFrequency: z.enum(['MONTHLY', 'ANNUAL', 'NONE']),
        maxCarryForward: z.number().min(0).default(0),
      }),
    )
    .default([]),
});

export const departmentSchema = z.object({
  name: z.string().min(1, 'Enter a name.').max(80),
  headEmployeeId: z.string().optional().or(z.literal('')),
});

export const holidaySchema = z.object({
  name: z.string().min(1, 'Enter a name.').max(120),
  date: z.string().date('Enter a valid date.'),
  location: z.string().max(80).default('All'),
});
