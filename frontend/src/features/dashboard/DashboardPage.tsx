import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { leaveApi } from '../leave/api';
import { referenceApi, type Holiday } from '../../lib/reference';
import { employeesApi } from '../employees/api';
import { LeaveBalanceSummary } from '../leave/LeaveBalanceSummary';
import type { LeaveBalance } from '../leave/types';
import styles from './DashboardPage.module.css';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function daysUntil(value: string) {
  const diff = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [approvalsCount, setApprovalsCount] = useState<number | null>(null);
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);

  const isManagerish = user?.role === 'MANAGER' || user?.role === 'HR' || user?.role === 'ADMIN';
  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN';

  useEffect(() => {
    leaveApi.balances().then(setBalances).catch(() => undefined);
    referenceApi.holidays().then(setHolidays).catch(() => undefined);
    if (isManagerish) {
      leaveApi.approvals().then((r) => setApprovalsCount(r.length)).catch(() => undefined);
    }
    if (isHrOrAdmin) {
      employeesApi.list().then((e) => setEmployeeCount(e.length)).catch(() => undefined);
    }
  }, [isManagerish, isHrOrAdmin]);

  const upcomingHolidays = holidays
    .filter((h) => new Date(h.date).getTime() >= new Date().setHours(0, 0, 0, 0))
    .slice(0, 5);

  return (
    <div>
      <h1>Welcome back, {user?.firstName}</h1>
      <p className={styles.subtitle}>Here's where things stand today.</p>

      <div className={styles.statRow}>
        {isManagerish ? (
          <Link to="/leave/approvals" className={styles.statCard}>
            <span className={styles.statNumber}>{approvalsCount ?? '—'}</span>
            <span className={styles.statLabel}>Pending approvals</span>
          </Link>
        ) : null}
        {isHrOrAdmin ? (
          <Link to="/employees" className={styles.statCard}>
            <span className={styles.statNumber}>{employeeCount ?? '—'}</span>
            <span className={styles.statLabel}>Total employees</span>
          </Link>
        ) : null}
        <Link to="/leave/calendar" className={styles.statCard}>
          <span className={styles.statNumber}>{upcomingHolidays.length}</span>
          <span className={styles.statLabel}>Upcoming holidays</span>
        </Link>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your leave balance</h2>
        <LeaveBalanceSummary balances={balances} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming holidays</h2>
        {upcomingHolidays.length === 0 ? (
          <p style={{ color: 'var(--color-ink-muted)' }}>No upcoming holidays on the calendar.</p>
        ) : (
          <ul className={styles.holidayList}>
            {upcomingHolidays.map((h) => (
              <li key={h.id} className={styles.holidayRow}>
                <span className={styles.holidayName}>{h.name}</span>
                <span className={styles.holidayDate}>
                  {formatDate(h.date)} · {daysUntil(h.date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
