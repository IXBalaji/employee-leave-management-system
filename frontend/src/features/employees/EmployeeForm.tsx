import { useMemo, useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Tabs, TabPanel, type TabDef } from '../../components/ui/Tabs';
import {
  buildEmployeeFormSchema,
  type EmployeeFormValues,
  GENDER_OPTIONS,
  MARITAL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
} from './schema';
import type { Department, Employee, LeavePolicySummary } from './types';
import styles from './EmployeeForm.module.css';

export type FormPermission = 'full' | 'self' | 'readonly';

const SELF_EDITABLE = new Set([
  'phone',
  'currentAddress',
  'permanentAddress',
  'emergencyContactName',
  'emergencyContactRelationship',
  'emergencyContactPhone',
  'bankName',
  'bankAccountNumber',
  'bankIfsc',
]);

const TAB_FIELDS: Record<string, (keyof EmployeeFormValues)[]> = {
  basic: ['firstName', 'lastName', 'photoUrl', 'dob', 'gender', 'bloodGroup', 'maritalStatus'],
  contact: ['personalEmail', 'workEmail', 'phone', 'currentAddress', 'permanentAddress'],
  job: ['departmentId', 'designation', 'employmentType', 'workLocation', 'dateOfJoining', 'reportingManagerId', 'role', 'status'],
  statutory: ['govIdNumber', 'bankName', 'bankAccountNumber', 'bankIfsc'],
  emergency: ['emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone'],
  leave: ['leavePolicyId'],
};

function toDateInput(value: string | null | undefined) {
  if (!value) return '';
  return value.slice(0, 10);
}

function defaultsFrom(employee?: Employee): EmployeeFormValues {
  return {
    firstName: employee?.firstName ?? '',
    lastName: employee?.lastName ?? '',
    photoUrl: employee?.photoUrl ?? '',
    dob: toDateInput(employee?.dob),
    gender: employee?.gender ?? '',
    bloodGroup: employee?.bloodGroup ?? '',
    maritalStatus: employee?.maritalStatus ?? '',
    personalEmail: employee?.personalEmail ?? '',
    workEmail: employee?.workEmail ?? '',
    phone: employee?.phone ?? '',
    currentAddress: employee?.currentAddress ?? '',
    permanentAddress: employee?.permanentAddress ?? '',
    departmentId: employee?.departmentId ?? '',
    designation: employee?.designation ?? '',
    employmentType: employee?.employmentType ?? 'FULL_TIME',
    workLocation: employee?.workLocation ?? '',
    dateOfJoining: toDateInput(employee?.dateOfJoining),
    reportingManagerId: employee?.reportingManagerId ?? '',
    govIdNumber: employee?.govIdNumber ?? '',
    bankName: employee?.bankName ?? '',
    bankAccountNumber: employee?.bankAccountNumber ?? '',
    bankIfsc: employee?.bankIfsc ?? '',
    emergencyContactName: employee?.emergencyContactName ?? '',
    emergencyContactRelationship: employee?.emergencyContactRelationship ?? '',
    emergencyContactPhone: employee?.emergencyContactPhone ?? '',
    leavePolicyId: employee?.leavePolicyId ?? '',
    role: employee?.role ?? 'EMPLOYEE',
    status: employee?.status ?? 'ACTIVE',
    password: '',
  };
}

function countErrorsForTab(errors: FieldErrors<EmployeeFormValues>, tab: string) {
  return TAB_FIELDS[tab].filter((field) => errors[field]).length;
}

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  permission: FormPermission;
  initialData?: Employee;
  departments: Department[];
  leavePolicies: LeavePolicySummary[];
  managers: { id: string; firstName: string; lastName: string }[];
  submitting: boolean;
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  serverFieldErrors?: Record<string, string[]>;
}

export function EmployeeForm({
  mode,
  permission,
  initialData,
  departments,
  leavePolicies,
  managers,
  submitting,
  onSubmit,
  serverFieldErrors,
}: EmployeeFormProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(buildEmployeeFormSchema(mode === 'create')),
    mode: 'onChange',
    defaultValues: defaultsFrom(initialData),
  });

  useMemo(() => {
    if (!serverFieldErrors) return;
    for (const [field, messages] of Object.entries(serverFieldErrors)) {
      setError(field as keyof EmployeeFormValues, { type: 'server', message: messages[0] });
    }
  }, [serverFieldErrors, setError]);

  const canEditAll = permission === 'full';
  const isReadOnly = permission === 'readonly';
  const isEditable = (field: string) => canEditAll || (permission === 'self' && SELF_EDITABLE.has(field));

  const tabs: TabDef[] = [
    { id: 'basic', label: 'Basic Info', errorCount: countErrorsForTab(errors, 'basic') },
    { id: 'contact', label: 'Contact', errorCount: countErrorsForTab(errors, 'contact') },
    { id: 'job', label: 'Job Details', errorCount: countErrorsForTab(errors, 'job') },
    { id: 'statutory', label: 'Statutory & Payroll', errorCount: countErrorsForTab(errors, 'statutory') },
    { id: 'emergency', label: 'Emergency Contact', errorCount: countErrorsForTab(errors, 'emergency') },
    { id: 'leave', label: 'Leave Policy', errorCount: countErrorsForTab(errors, 'leave') },
  ];

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={submit} noValidate className={styles.form}>
      <Tabs label="Employee record sections" idPrefix="emp" tabs={tabs} activeId={activeTab} onChange={setActiveTab} />

      <TabPanel id="basic" activeId={activeTab} idPrefix="emp">
        <div className={styles.grid}>
          {mode === 'edit' && initialData ? (
            <Field label="Employee ID">
              <Input value={initialData.employeeCode} disabled />
            </Field>
          ) : null}
          <Field label="First name" error={errors.firstName?.message} required>
            <Input disabled={!isEditable('firstName')} {...register('firstName')} />
          </Field>
          <Field label="Last name" error={errors.lastName?.message} required>
            <Input disabled={!isEditable('lastName')} {...register('lastName')} />
          </Field>
          <Field label="Photo URL" hint="Link to a hosted profile photo" error={errors.photoUrl?.message}>
            <Input disabled={!isEditable('photoUrl')} {...register('photoUrl')} />
          </Field>
          <Field label="Date of birth" error={errors.dob?.message}>
            <Input type="date" disabled={!isEditable('dob')} {...register('dob')} />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <Select disabled={!isEditable('gender')} {...register('gender')}>
              <option value="">Not specified</option>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Blood group" error={errors.bloodGroup?.message}>
            <Input disabled={!isEditable('bloodGroup')} placeholder="O+" {...register('bloodGroup')} />
          </Field>
          <Field label="Marital status" error={errors.maritalStatus?.message}>
            <Select disabled={!isEditable('maritalStatus')} {...register('maritalStatus')}>
              <option value="">Not specified</option>
              {MARITAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </TabPanel>

      <TabPanel id="contact" activeId={activeTab} idPrefix="emp">
        <div className={styles.grid}>
          <Field label="Personal email" error={errors.personalEmail?.message}>
            <Input type="email" disabled={!isEditable('personalEmail')} {...register('personalEmail')} />
          </Field>
          <Field label="Work email" hint="Used to sign in" error={errors.workEmail?.message} required>
            <Input type="email" disabled={!isEditable('workEmail')} {...register('workEmail')} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input type="tel" disabled={!isEditable('phone')} {...register('phone')} />
          </Field>
          <Field label="Current address" error={errors.currentAddress?.message}>
            <Input disabled={!isEditable('currentAddress')} {...register('currentAddress')} />
          </Field>
          <Field label="Permanent address" error={errors.permanentAddress?.message}>
            <Input disabled={!isEditable('permanentAddress')} {...register('permanentAddress')} />
          </Field>
        </div>
      </TabPanel>

      <TabPanel id="job" activeId={activeTab} idPrefix="emp">
        <div className={styles.grid}>
          <Field label="Department" error={errors.departmentId?.message} required>
            <Select disabled={!isEditable('departmentId')} {...register('departmentId')}>
              <option value="" disabled>
                Select a department
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Designation" error={errors.designation?.message} required>
            <Input disabled={!isEditable('designation')} {...register('designation')} />
          </Field>
          <Field label="Employment type" error={errors.employmentType?.message} required>
            <Select disabled={!isEditable('employmentType')} {...register('employmentType')}>
              {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Work location" error={errors.workLocation?.message}>
            <Input disabled={!isEditable('workLocation')} {...register('workLocation')} />
          </Field>
          <Field label="Date of joining" error={errors.dateOfJoining?.message} required>
            <Input type="date" disabled={!isEditable('dateOfJoining')} {...register('dateOfJoining')} />
          </Field>
          <Field label="Reporting manager" error={errors.reportingManagerId?.message}>
            <Select disabled={!isEditable('reportingManagerId')} {...register('reportingManagerId')}>
              <option value="">None</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </Select>
          </Field>
          {canEditAll ? (
            <>
              <Field label="Role" error={errors.role?.message} required>
                <Select disabled={!isEditable('role')} {...register('role')}>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status" error={errors.status?.message} required>
                <Select disabled={!isEditable('status')} {...register('status')}>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </>
          ) : null}
        </div>
      </TabPanel>

      <TabPanel id="statutory" activeId={activeTab} idPrefix="emp">
        <div className={styles.grid}>
          <Field label="Government ID number" error={errors.govIdNumber?.message}>
            <Input disabled={!isEditable('govIdNumber')} {...register('govIdNumber')} />
          </Field>
          <Field label="Bank name" error={errors.bankName?.message}>
            <Input disabled={!isEditable('bankName')} {...register('bankName')} />
          </Field>
          <Field label="Bank account number" error={errors.bankAccountNumber?.message}>
            <Input disabled={!isEditable('bankAccountNumber')} {...register('bankAccountNumber')} />
          </Field>
          <Field label="IFSC code" hint="e.g. SBIN0001234" error={errors.bankIfsc?.message}>
            <Input disabled={!isEditable('bankIfsc')} {...register('bankIfsc')} />
          </Field>
        </div>
      </TabPanel>

      <TabPanel id="emergency" activeId={activeTab} idPrefix="emp">
        <div className={styles.grid}>
          <Field label="Contact name" error={errors.emergencyContactName?.message}>
            <Input disabled={!isEditable('emergencyContactName')} {...register('emergencyContactName')} />
          </Field>
          <Field label="Relationship" error={errors.emergencyContactRelationship?.message}>
            <Input disabled={!isEditable('emergencyContactRelationship')} {...register('emergencyContactRelationship')} />
          </Field>
          <Field label="Contact phone" error={errors.emergencyContactPhone?.message}>
            <Input type="tel" disabled={!isEditable('emergencyContactPhone')} {...register('emergencyContactPhone')} />
          </Field>
        </div>
      </TabPanel>

      <TabPanel id="leave" activeId={activeTab} idPrefix="emp">
        <div className={styles.grid}>
          <Field label="Leave policy" hint="Determines annual leave allocation" error={errors.leavePolicyId?.message}>
            <Select disabled={!isEditable('leavePolicyId')} {...register('leavePolicyId')}>
              <option value="">Not assigned</option>
              {leavePolicies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          {mode === 'create' && canEditAll ? (
            <div>
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Temporary password *</span>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-faint)' }}>At least 8 characters. The employee can change it later.</p>
              <input type="password" {...register('password')} style={{ width: '100%', padding: '0.55rem 0.7rem', border: '1.5px solid var(--color-rule-strong)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }} />
              {errors.password?.message ? <p style={{ color: 'var(--color-rust)', fontSize: 'var(--text-sm)' }}>{errors.password.message}</p> : null}
            </div>
          ) : null}
        </div>
      </TabPanel>

      {!isReadOnly ? (
        <div className={styles.actions}>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
