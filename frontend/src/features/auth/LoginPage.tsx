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
        <div className={styles.stampCorner} aria-hidden="true">
          ELMS
        </div>
        <h1 className={styles.title}>Sign in</h1>
        <p style={{ color: '#c8c8c8', fontSize: 'var(--text-sm)' }}>Employee Leave Management System</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
          {formError ? (
            <p role="alert" className={styles.formError}>
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
