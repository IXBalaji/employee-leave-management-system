import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusStamp, type StampTone } from '../../components/ui/StatusStamp';
import { employeesApi } from './api';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
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
  useDocumentTitle('My Team');
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <h1>My team</h1>
        <img src="/icons/team-icon.png" width={24} height={24} alt="Team icon" />
        <button onClick={() => window.print()} aria-label="Print team page" style={{ width: '24px', height: '24px', padding: 0, border: 'none', background: 'none', outline: 'none' }}>
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" fill="currentColor"/></svg>
        </button>
        <button onClick={() => {}} style={{ width: '24px', height: '24px', padding: 0, border: 'none', background: 'none' }}>
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/></svg>
        </button>
      </div>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-3)' }}>People who report directly to you.</p>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-3)' }}>Danke für eure harte Arbeit in diesem Quartal.</p>
      <input type="text" placeholder="Search team..." style={{ marginBottom: 'var(--space-3)', padding: '0.4rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
      <h3>Team roster</h3>
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
