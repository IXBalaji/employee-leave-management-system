import { useEffect, useState } from 'react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { ApiError } from '../../lib/api';
import { leaveApi } from './api';
import type { LeaveRequest } from './types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ApprovalsPage() {
  const { notify } = useToast();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const load = () => leaveApi.approvals().then(setRequests).catch(() => undefined).finally(() => setIsLoading(false));

  useEffect(() => {
    load();
  }, []);

  const decide = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setDecidingId(id);
    try {
      await leaveApi.decide(id, status, comments[id]);
      notify('success', status === 'APPROVED' ? 'Request approved.' : 'Request rejected.');
      load();
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setDecidingId(null);
    }
  };

  const columns: Column<LeaveRequest>[] = [
    { key: 'employee', header: 'Employee', render: (r) => `${r.employee.firstName} ${r.employee.lastName}` },
    { key: 'type', header: 'Leave type', render: (r) => r.leaveType.name },
    { key: 'dates', header: 'Dates', render: (r) => `${formatDate(r.startDate)} – ${formatDate(r.endDate)}` },
    { key: 'reason', header: 'Reason', render: (r) => r.reason },
    {
      key: 'comment',
      header: 'Comment (optional)',
      render: (r) => (
        <label>
          <span className="visually-hidden">Comment for {r.employee.firstName} {r.employee.lastName}'s request</span>
          <Input
            value={comments[r.id] ?? ''}
            onChange={(e) => setComments((prev) => ({ ...prev, [r.id]: e.target.value }))}
            placeholder="Optional note"
          />
        </label>
      ),
    },
    {
      key: 'actions',
      header: 'Decision',
      render: (r) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button size="sm" disabled={decidingId === r.id} onClick={() => decide(r.id, 'APPROVED')}>
            Approve
          </Button>
          <Button variant="danger" size="sm" disabled={decidingId === r.id} onClick={() => decide(r.id, 'REJECTED')}>
            Reject
          </Button>
          <button onClick={() => {}}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" fill="currentColor"/></svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1>Approvals</h1>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-5)' }}>Requests waiting on your decision.</p>
      <DataTable
        caption="Pending leave requests"
        columns={columns}
        rows={requests}
        getRowKey={(r) => r.id}
        emptyMessage={isLoading ? 'Loading…' : 'Nothing waiting on you right now.'}
      />
    </div>
  );
}
