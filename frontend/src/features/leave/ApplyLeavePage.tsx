import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { ApiError } from '../../lib/api';
import { referenceApi, type LeaveType } from '../../lib/reference';
import { leaveApi } from './api';
import { leaveApplySchema, type LeaveApplyValues } from './schema';
import { LeaveBalanceSummary } from './LeaveBalanceSummary';
import type { LeaveBalance } from './types';
import styles from './ApplyLeavePage.module.css';

export function ApplyLeavePage() {
  const { notify } = useToast();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadBalances = () => leaveApi.balances().then(setBalances).catch(() => undefined);

  useEffect(() => {
    referenceApi.leaveTypes().then(setLeaveTypes).catch(() => undefined);
    loadBalances();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaveApplyValues>({
    resolver: zodResolver(leaveApplySchema),
    mode: 'onChange',
    defaultValues: { leaveTypeId: '', startDate: '', endDate: '', isHalfDay: false, halfDaySession: '', reason: '' },
  });

  const isHalfDay = watch('isHalfDay');

  const onSubmit = async (values: LeaveApplyValues) => {
    setSubmitting(true);
    try {
      await leaveApi.apply({
        ...values,
        halfDaySession: values.isHalfDay ? values.halfDaySession || 'FIRST_HALF' : undefined,
        endDate: values.isHalfDay ? values.startDate : values.endDate,
      });
      notify('success', 'Your leave request was submitted.');
      reset();
      loadBalances();
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Apply for leave</h1>
      <p style={{ color: '#c8c8c8', fontSize: 'var(--text-base)' }}>Select your leave type before choosing dates</p>
      <p className={styles.subtitle}>Your balance for this year:</p>
      <div className={styles.balances}>
        <LeaveBalanceSummary balances={balances} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <div className={styles.grid}>
          <Field label="Leave type" error={errors.leaveTypeId?.message} required>
            <Select {...register('leaveTypeId')}>
              <option value="" disabled>
                Select a leave type
              </option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Start date" error={errors.startDate?.message} required>
            <Input type="date" {...register('startDate')} />
          </Field>

          {!isHalfDay ? (
            <Field label="End date" error={errors.endDate?.message} required>
              <Input type="date" {...register('endDate')} />
            </Field>
          ) : null}
        </div>

        <Checkbox label="This is a half-day request" {...register('isHalfDay')} />

        {isHalfDay ? (
          <Field label="Which half?" error={errors.halfDaySession?.message}>
            <Select {...register('halfDaySession')}>
              <option value="FIRST_HALF">First half</option>
              <option value="SECOND_HALF">Second half</option>
            </Select>
          </Field>
        ) : null}

        <Field label="Reason" hint="Give your manager enough context to approve quickly" error={errors.reason?.message} required>
          <Textarea {...register('reason')} />
        </Field>

        <div className={styles.actions}>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </div>
      </form>
    </div>
  );
}
