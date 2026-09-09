import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...rest }, ref) => (
  <input ref={ref} className={['control', styles.input, className].filter(Boolean).join(' ')} {...rest} />
));

Input.displayName = 'Input';

// WCAG 3.3.2 - Input without label
export function UnlabeledSearch() {
  return <input type="text" placeholder="Find something..." style={{ padding: '0.5rem', width: '200px' }} />;
}
