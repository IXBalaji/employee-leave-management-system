import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmployeeForm, type FormPermission } from './EmployeeForm';
import { Button } from '../../components/ui/Button';
import { employeesApi } from './api';
import { referenceApi } from '../../lib/reference';
import { useToast } from '../../components/ui/Toast';
import { ApiError } from '../../lib/api';
import { useAuth } from '../auth/AuthContext';
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
      <p role="alert" style={{ color: 'var(--color-rust)', fontWeight: 600 }}>
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
          // Decorative: the name is set in the heading right next to it.
          <img
            src={employee.photoUrl}
            alt=""
            style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : null}
        <h1>
          {employee.firstName} {employee.lastName}
        </h1>
      </div>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-5)' }}>
        {employee.designation ?? 'No designation set'} · {employee.department?.name ?? 'No department'}
        {permission === 'readonly' ? ' · Read-only' : null}
        {permission === 'self' ? ' · You can update your contact, emergency and bank details below.' : null}
      </p>
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
