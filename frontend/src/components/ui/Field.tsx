import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactElement<{
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
  }>;
  /** Extra node rendered inline next to the label, e.g. a live char counter. */
  labelExtra?: ReactNode;
}

/**
 * Wires a single form control to its label, hint and error text using
 * for/id + aria-describedby, so assistive tech announces the same
 * information a sighted user sees. The error is announced immediately
 * because aria-invalid + aria-describedby update live as validation runs.
 */
export function Field({ label, hint, error, required, children, labelExtra }: FieldProps) {
  const uid = useId();
  const inputId = `${uid}-input`;
  const hintId = hint ? `${uid}-hint` : undefined;
  const errorId = error ? `${uid}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: inputId,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
        'aria-required': required,
      })
    : children;

  return (
    <div className={styles.field} data-invalid={Boolean(error)}>
      <div className={styles.labelRow}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
        {labelExtra}
      </div>
      {control}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M8 1 15 14.5H1L8 1Zm0 4.5a.9.9 0 0 0-.9.9v3.4a.9.9 0 0 0 1.8 0V6.4A.9.9 0 0 0 8 5.5Zm0 6.6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
            />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}
