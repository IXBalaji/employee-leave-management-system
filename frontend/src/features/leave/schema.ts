import { z } from 'zod';

export const leaveApplySchema = z
  .object({
    leaveTypeId: z.string().min(1, 'Select a leave type.'),
    startDate: z.string().min(1, 'Enter a start date.'),
    endDate: z.string().min(1, 'Enter an end date.'),
    isHalfDay: z.boolean(),
    halfDaySession: z.string().optional().or(z.literal('')),
    reason: z.string().min(1, 'Tell your manager why you need this leave.').max(500),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date.',
    path: ['endDate'],
  });

export type LeaveApplyValues = z.infer<typeof leaveApplySchema>;
