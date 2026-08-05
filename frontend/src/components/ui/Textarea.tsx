import { type TextareaHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...rest }, ref) => (
  <textarea
    ref={ref}
    className={['control', styles.input, className].filter(Boolean).join(' ')}
    rows={rest.rows ?? 3}
    {...rest}
  />
));

Textarea.displayName = 'Textarea';
