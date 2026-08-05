import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import {
  ACCRUAL_OPTIONS,
  leavePolicyFormSchema,
  type LeavePolicyFormInput,
  type LeavePolicyFormValues,
} from './leavePolicySchema';
import type { LeavePolicy, LeaveType } from '../../lib/reference';
import styles from './LeavePolicyForm.module.css';

interface LeavePolicyFormProps {
  leaveTypes: LeaveType[];
  initialData?: LeavePolicy;
  submitting: boolean;
  onSubmit: (values: LeavePolicyFormValues) => Promise<void>;
  onCancel?: () => void;
}

function defaultsFrom(policy?: LeavePolicy): LeavePolicyFormInput {
  return {
    name: policy?.name ?? '',
    description: policy?.description ?? '',
    rules: policy?.rules.map((r) => ({
      leaveTypeId: r.leaveTypeId,
      annualDays: r.annualDays,
      accrualFrequency: r.accrualFrequency,
      maxCarryForward: r.maxCarryForward,
    })) ?? [{ leaveTypeId: '', annualDays: 0, accrualFrequency: 'ANNUAL', maxCarryForward: 0 }],
  };
}

export function LeavePolicyForm({ leaveTypes, initialData, submitting, onSubmit, onCancel }: LeavePolicyFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeavePolicyFormInput, unknown, LeavePolicyFormValues>({
    resolver: zodResolver(leavePolicyFormSchema),
    mode: 'onChange',
    defaultValues: defaultsFrom(initialData),
  });

  useEffect(() => {
    reset(defaultsFrom(initialData));
  }, [initialData, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'rules' });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
      className={styles.form}
    >
      <div className={styles.grid}>
        <Field label="Policy name" error={errors.name?.message} required>
          <Input {...register('name')} />
        </Field>
        <Field label="Description" error={errors.description?.message}>
          <Input {...register('description')} />
        </Field>
      </div>

      <h2 className={styles.rulesTitle}>Leave type rules</h2>
      {errors.rules?.message ? (
        <p role="alert" className={styles.rulesError}>
          {errors.rules.message}
        </p>
      ) : null}

      <div className={styles.rules}>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.ruleRow}>
            <Field label="Leave type" error={errors.rules?.[index]?.leaveTypeId?.message} required>
              <Select {...register(`rules.${index}.leaveTypeId` as const)}>
                <option value="" disabled>
                  Select
                </option>
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Annual days" error={errors.rules?.[index]?.annualDays?.message} required>
              <Input type="number" min={0} step={0.5} {...register(`rules.${index}.annualDays` as const)} />
            </Field>
            <Field label="Accrual" error={errors.rules?.[index]?.accrualFrequency?.message} required>
              <Select {...register(`rules.${index}.accrualFrequency` as const)}>
                {ACCRUAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Max carry-forward" error={errors.rules?.[index]?.maxCarryForward?.message} required>
              <Input type="number" min={0} step={0.5} {...register(`rules.${index}.maxCarryForward` as const)} />
            </Field>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              aria-label={`Remove rule ${index + 1}`}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ leaveTypeId: '', annualDays: 0, accrualFrequency: 'ANNUAL', maxCarryForward: 0 })}
      >
        Add another leave type
      </Button>

      <div className={styles.actions}>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : initialData ? 'Save changes' : 'Create policy'}
        </Button>
      </div>
    </form>
  );
}
