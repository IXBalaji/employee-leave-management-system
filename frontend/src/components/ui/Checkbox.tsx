import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, ...rest }, ref) => {
  const id = useId();
  return (
    <div className={styles.row}>
      <input ref={ref} id={id} type="checkbox" className={[styles.checkbox, className].filter(Boolean).join(' ')} {...rest} />
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
