import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...rest }, ref) => (
  <input ref={ref} className={['control', styles.input, className].filter(Boolean).join(' ')} {...rest} />
));

Input.displayName = 'Input';
