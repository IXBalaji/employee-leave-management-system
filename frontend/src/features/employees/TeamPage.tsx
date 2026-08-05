import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusStamp, type StampTone } from '../../components/ui/StatusStamp';
import { employeesApi } from './api';
import type { Employee, EmployeeStatus } from './types';

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

export function TeamPage() {
  const [team, setTeam] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    employeesApi
      .myTeam()
      .then(setTeam)
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (e) => (
        <Link to={`/employees/${e.id}`} style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
          {e.firstName} {e.lastName}
        </Link>
      ),
    },
    { key: 'designation', header: 'Designation', render: (e) => e.designation ?? '—' },
    { key: 'status', header: 'Status', render: (e) => <StatusStamp tone={STATUS_TONE[e.status]} label={STATUS_LABEL[e.status]} /> },
  ];

  return (
    <div>
      <h1>My team</h1>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-5)' }}>People who report directly to you.</p>
      <DataTable
        caption="My team"
        columns={columns}
        rows={team}
        getRowKey={(e) => e.id}
        emptyMessage={isLoading ? 'Loading…' : 'No one reports to you yet.'}
      />
    </div>
  );
}
