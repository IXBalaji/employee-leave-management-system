import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { useAuth } from './AuthContext';
import { ApiError } from '../../lib/api';
import styles from './LoginPage.module.css';

const loginSchema = z.object({
  workEmail: z.string().min(1, 'Enter your work email.').email('Enter a valid email address, like name@company.com.'),
  password: z.string().min(1, 'Enter your password.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), mode: 'onChange' });

  const onSubmit = async (data: LoginForm) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await login(data.workEmail, data.password);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {/*
          INTENTIONAL A11Y VIOLATION: Authorized accessibility testing fixture.
          Violation: 1/5
          Rule: image-alt
          Test: src/scan/tests/login.spec.ts / full accessibility scan of the sign-in form
        */}
        <img className={styles.stampCorner} src="/favicon.svg" width={48} height={48} alt="" />
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Employee Leave Management System</p>
        {/*
          INTENTIONAL A11Y VIOLATION: Authorized accessibility testing fixture.
          Violation: 2/5
          Rule: button-name
          Test: src/scan/tests/login.spec.ts / full accessibility scan of the sign-in form
        */}
        <button
          type="button"
          className={styles.helpButton}
          onClick={() => undefined}
          aria-label="Help"
        >
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M7.5 7.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8v.5M10 14.5h.01"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
          {formError ? (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          ) : null}

          <Field label="Work email" error={errors.workEmail?.message} required>
            <Input type="email" autoComplete="username" placeholder="name@company.com" {...register('workEmail')} />
          </Field>

          <Field label="Password" error={errors.password?.message} required>
            <Input type="password" autoComplete="current-password" {...register('password')} />
          </Field>

          <Button type="submit" disabled={submitting} style={{ marginTop: '0.5rem' }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  );
}
