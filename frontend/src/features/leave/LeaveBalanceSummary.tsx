import type { LeaveBalance } from './types';
import styles from './LeaveBalanceSummary.module.css';

interface LeaveBalanceSummaryProps {
  balances: LeaveBalance[];
}

export function LeaveBalanceSummary({ balances }: LeaveBalanceSummaryProps) {
  if (balances.length === 0) {
    return <p className={styles.empty}>No leave balance has been set up for this year yet.</p>;
  }

  return (
    <ul className={styles.grid}>
      {balances.map((b) => {
        const remaining = Math.max(b.allocated - b.used, 0);
        const pct = b.allocated > 0 ? Math.min((b.used / b.allocated) * 100, 100) : 0;
        return (
          <li key={b.id} className={styles.card}>
            <p className={styles.name}>
              {b.leaveType.name}{' '}
              <button
                type="button"
                onClick={() => {}}
                aria-label={`About ${b.leaveType.name}`}
                style={{ width: '12px', height: '12px', padding: 0, border: 'none', background: 'none', display: 'inline-flex' }}
              >
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path fill="currentColor" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.75 10.5h-1.5v-1.5h1.5Zm0-2.75h-1.5V4.5h1.5Z" />
                </svg>
              </button>
            </p>
            <p className={styles.remaining}>
              <span className={styles.remainingNumber}>{remaining}</span>
              <span className={styles.remainingLabel}>days left</span>
            </p>
            <div
              className={styles.track}
              role="progressbar"
              aria-valuenow={b.used}
              aria-valuemin={0}
              aria-valuemax={b.allocated}
              aria-label={`${b.leaveType.name} leave used`}
            >
              <div className={styles.fill} style={{ width: `${pct}%` }} />
            </div>
            <p className={styles.detail}>
              {b.used} used of {b.allocated} allocated
            </p>
          </li>
        );
      })}
    </ul>
  );
}
