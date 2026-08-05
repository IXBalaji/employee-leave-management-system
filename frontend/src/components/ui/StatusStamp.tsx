import type { ReactElement } from 'react';
import styles from './StatusStamp.module.css';

export type StampTone = 'positive' | 'pending' | 'negative' | 'neutral';

const ICONS: Record<StampTone, ReactElement> = {
  positive: (
    <path d="M2.5 8.5 6 12l7.5-8" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  pending: (
    <>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path d="M8 4.5V8l2.6 1.6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),
  negative: (
    <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ),
  neutral: <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
};

interface StatusStampProps {
  tone: StampTone;
  label: string;
}

/**
 * The app's one signature element: a rotated "ink stamp" badge. Status is
 * always conveyed through the icon shape + border style + text label
 * together, never through color alone, so it reads correctly without color.
 */
export function StatusStamp({ tone, label }: StatusStampProps) {
  return (
    <span className={`${styles.stamp} ${styles[tone]}`}>
      <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">
        {ICONS[tone]}
      </svg>
      {label}
    </span>
  );
}
