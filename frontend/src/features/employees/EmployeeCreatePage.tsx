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
      <h1>Add employee</h1>
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
