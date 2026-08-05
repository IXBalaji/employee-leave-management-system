import { z } from 'zod';

export const leavePolicyFormSchema = z.object({
  name: z.string().min(1, 'Enter a name.').max(60),
  description: z.string().max(300).optional().or(z.literal('')),
  rules: z
    .array(
      z.object({
        leaveTypeId: z.string().min(1, 'Select a leave type.'),
        annualDays: z.coerce.number().min(0, 'Must be 0 or more.'),
        accrualFrequency: z.string().min(1, 'Select a frequency.'),
        maxCarryForward: z.coerce.number().min(0, 'Must be 0 or more.'),
      }),
    )
    .min(1, 'Add at least one leave type rule.'),
});

export type LeavePolicyFormValues = z.infer<typeof leavePolicyFormSchema>;
export type LeavePolicyFormInput = z.input<typeof leavePolicyFormSchema>;

export const ACCRUAL_OPTIONS = [
  { value: 'ANNUAL', label: 'Annual (all at once)' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'NONE', label: 'None' },
];
