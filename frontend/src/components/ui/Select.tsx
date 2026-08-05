import { type SelectHTMLAttributes, forwardRef } from 'react';
import styles from './Select.module.css';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...rest }, ref) => (
  <div className={styles.wrap}>
    <select ref={ref} className={['control', styles.select, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </select>
    <svg className={styles.chevron} viewBox="0 0 12 8" width="12" height="8" aria-hidden="true" focusable="false">
      <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  </div>
));

Select.displayName = 'Select';
