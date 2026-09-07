import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeForm } from './EmployeeForm';
import { employeesApi } from './api';
import { referenceApi } from '../../lib/reference';
import { useToast } from '../../components/ui/Toast';
import { ApiError } from '../../lib/api';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import type { Department, Employee, LeavePolicySummary } from './types';
import type { EmployeeFormValues } from './schema';

export function EmployeeCreatePage() {
  useDocumentTitle('Add Employee');
  const navigate = useNavigate();
  const { notify } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicySummary[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

  useEffect(() => {
    referenceApi.departments().then(setDepartments).catch(() => undefined);
    referenceApi.leavePolicies().then(setLeavePolicies).catch(() => undefined);
    employeesApi.list().then(setManagers).catch(() => undefined);
  }, []);

  const handleSubmit = async (values: EmployeeFormValues) => {
    setSubmitting(true);
    setFieldErrors(undefined);
    try {
      const employee = await employeesApi.create(values);
      notify('success', `${employee.firstName} ${employee.lastName} was added.`);
      navigate(`/employees/${employee.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        notify('error', err.message);
      } else {
        notify('error', 'Something went wrong. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <h1>Add employee</h1>
        <button style={{ width: '20px', height: '20px', padding: 0, border: 'none', background: 'none' }}>
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path
              fill="currentColor"
              d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.75 10.5h-1.5v-1.5h1.5Zm0-2.75h-1.5V4.5h1.5Z"
            />
          </svg>
        </button>
      </div>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-5)' }}>
        Fill in each section — errors show up as you type.
      </p>
      <EmployeeForm
        mode="create"
        permission="full"
        departments={departments}
        leavePolicies={leavePolicies}
        managers={managers}
        submitting={submitting}
        onSubmit={handleSubmit}
        serverFieldErrors={fieldErrors}
      />
    </div>
  );
}
