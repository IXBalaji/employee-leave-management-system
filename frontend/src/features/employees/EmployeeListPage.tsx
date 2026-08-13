import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusStamp, type StampTone } from '../../components/ui/StatusStamp';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { employeesApi } from './api';
import { referenceApi } from '../../lib/reference';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import type { Department, Employee, EmployeeStatus } from './types';
import { STATUS_OPTIONS } from './schema';
import styles from './EmployeeListPage.module.css';

const STATUS_TONE: Record<EmployeeStatus, StampTone> = {
  ACTIVE: 'positive',
  ON_LEAVE: 'pending',
  INACTIVE: 'negative',
};

const STATUS_LABEL: Record<EmployeeStatus, string> = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  INACTIVE: 'Inactive',
};

export function EmployeeListPage() {
  useDocumentTitle('Employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [q, setQ] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    referenceApi.departments().then(setDepartments).catch(() => undefined);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setIsLoading(true);
      employeesApi
        .list({ q: q || undefined, departmentId: departmentId || undefined, status: status || undefined })
        .then(setEmployees)
        .catch(() => setError('Could not load employees. Try again.'))
        .finally(() => setIsLoading(false));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [q, departmentId, status]);

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: false,
      render: (e) => (
        <Link to={`/employees/${e.id}`} className={styles.nameLink}>
          {e.firstName} {e.lastName}
          <span className={styles.code}>{e.employeeCode}</span>
        </Link>
      ),
    },
    { key: 'department', header: 'Department', render: (e) => e.department?.name ?? '—' },
    { key: 'designation', header: 'Designation', render: (e) => e.designation ?? '—' },
    {
      key: 'status',
      header: 'Status',
      render: (e) => <StatusStamp tone={STATUS_TONE[e.status]} label={STATUS_LABEL[e.status]} />,
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Employees</h1>
          <img src="/icons/team-banner.png" width={320} height={60} alt="Team banner" />
          {/* a11y-violation 5/5: empty-heading — heading with no text content (WCAG 2.4.6 Headings and Labels) */}
          <h2 className={styles.subtitle}></h2>
          <p className={styles.subtitle}>{employees.length} record{employees.length === 1 ? '' : 's'}</p>
        </div>
        <Link to="/employees/new" className={styles.newLink}>
          Add employee
        </Link>
        <a href="/employees/export" className={styles.newLink} aria-label="Export employees">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/></svg>
        </a>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <label htmlFor="employee-search" className="visually-hidden">
            Search employees by name, email or ID
          </label>
          <Input
            id="employee-search"
            type="search"
            placeholder="Search by name, email or ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <label htmlFor="dept-filter" className="visually-hidden">
          Filter by department
        </label>
        <Select id="dept-filter" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <label htmlFor="status-filter" className="visually-hidden">
          Filter by status
        </label>
        <Select id="status-filter" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : (
        <DataTable
          caption="Employees"
          columns={columns}
          rows={employees}
          getRowKey={(e) => e.id}
          emptyMessage={isLoading ? 'Loading…' : 'No employees match your search.'}
        />
      )}
    </div>
  );
}
