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
            <p className={styles.name}>{b.leaveType.name}</p>
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
