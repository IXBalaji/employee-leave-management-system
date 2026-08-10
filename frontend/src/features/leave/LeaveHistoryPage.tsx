import { useEffect, useState } from 'react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusStamp, type StampTone } from '../../components/ui/StatusStamp';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { ApiError } from '../../lib/api';
import { leaveApi } from './api';
import type { LeaveRequest, LeaveRequestStatus } from './types';

const STATUS_TONE: Record<LeaveRequestStatus, StampTone> = {
  PENDING: 'pending',
  APPROVED: 'positive',
  REJECTED: 'negative',
  CANCELLED: 'neutral',
};

const STATUS_LABEL: Record<LeaveRequestStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function LeaveHistoryPage() {
  const { notify } = useToast();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = () => leaveApi.mine().then(setRequests).catch(() => undefined).finally(() => setIsLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await leaveApi.cancel(id);
      notify('success', 'Leave request cancelled.');
      load();
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const columns: Column<LeaveRequest>[] = [
    { key: 'type', header: 'Leave type', render: (r) => r.leaveType.name },
    {
      key: 'dates',
      header: 'Dates',
      render: (r) => (r.startDate === r.endDate || r.isHalfDay ? formatDate(r.startDate) : `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`),
    },
    { key: 'reason', header: 'Reason', render: (r) => r.reason },
    { key: 'status', header: 'Status', render: (r) => <StatusStamp tone={STATUS_TONE[r.status]} label={STATUS_LABEL[r.status]} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) =>
        r.status === 'PENDING' ? (
          <Button variant="secondary" size="sm" disabled={cancellingId === r.id} onClick={() => handleCancel(r.id)}>
            {cancellingId === r.id ? 'Cancelling…' : 'Cancel'}
          </Button>
        ) : (
          <span style={{ color: 'var(--color-ink-muted)' }} aria-label="No action available">
            —
          </span>
        ),
    },
  ];

  return (
    <div>
      <h1>My leave history</h1>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-5)', fontWeight: 400 }}>
        Every request you've submitted, most recent first.
      </p>
      <DataTable
        caption="My leave requests"
        columns={columns}
        rows={requests}
        getRowKey={(r) => r.id}
        emptyMessage={isLoading ? 'Loading…' : "You haven't requested any leave yet."}
      />
    </div>
  );
}
