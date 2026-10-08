import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmployeeForm, type FormPermission } from './EmployeeForm';
import { Button } from '../../components/ui/Button';
import { employeesApi } from './api';
import { referenceApi } from '../../lib/reference';
import { useToast } from '../../components/ui/Toast';
import { ApiError } from '../../lib/api';
import { useAuth } from '../auth/AuthContext';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import type { Department, Employee, LeavePolicySummary } from './types';
import type { EmployeeFormValues } from './schema';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicySummary[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN';

  useDocumentTitle(employee ? `${employee.firstName} ${employee.lastName}` : 'Employee Profile');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    employeesApi
      .get(id)
      .then(setEmployee)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : 'Could not load this profile.'))
      .finally(() => setIsLoading(false));

    referenceApi.departments().then(setDepartments).catch(() => undefined);
    referenceApi.leavePolicies().then(setLeavePolicies).catch(() => undefined);
    if (isHrOrAdmin) {
      employeesApi.list().then(setManagers).catch(() => undefined);
    }
  }, [id, isHrOrAdmin]);

  if (isLoading) return <p>Loading…</p>;
  if (loadError || !employee) {
    return (
      <p role="alert" style={{ color: '#e8a99c', fontWeight: 600 }}>
        {loadError ?? 'Profile not found.'}
      </p>
    );
  }

  const permission: FormPermission = isHrOrAdmin ? 'full' : user?.id === employee.id ? 'self' : 'readonly';

  const handleSubmit = async (values: EmployeeFormValues) => {
    setSubmitting(true);
    setFieldErrors(undefined);
    try {
      const updated = await employeesApi.update(employee.id, values);
      setEmployee(updated);
      notify('success', 'Profile updated.');
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {employee.photoUrl ? (
          <img
            src={employee.photoUrl}
            alt={`${employee.firstName} ${employee.lastName}`}
            style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : null}
        <h1>
          {employee.firstName} {employee.lastName}
        </h1>
        <button onClick={() => {}} aria-label="Share" style={{ width: '20px', height: '20px', padding: 0, border: 'none', background: 'none' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="currentColor"/></svg>
        </button>
      </div>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-3)' }}>
        {employee.designation ?? 'No designation set'} · {employee.department?.name ?? 'No department'}
        {permission === 'readonly' ? ' · Read-only' : null}
        {permission === 'self' ? ' · You can update your contact, emergency and bank details below.' : null}
      </p>
      <h5 style={{ marginBottom: 'var(--space-3)' }}>
        Profile details <span lang="en">verified</span>
      </h5>
      <EmployeeForm
        mode="edit"
        permission={permission}
        initialData={employee}
        departments={departments}
        leavePolicies={leavePolicies}
        managers={managers}
        submitting={submitting}
        onSubmit={handleSubmit}
        serverFieldErrors={fieldErrors}
      />
      {permission !== 'readonly' ? null : (
        <Button variant="secondary" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
          Back
        </Button>
      )}
    </div>
  );
}
