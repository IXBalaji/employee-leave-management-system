import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { ApiError } from '../../lib/api';
import { referenceApi, type LeavePolicy, type LeaveType } from '../../lib/reference';
import { adminApi } from './adminApi';
import { LeavePolicyForm } from './LeavePolicyForm';
import type { LeavePolicyFormValues } from './leavePolicySchema';
import styles from './LeavePoliciesPage.module.css';

export function LeavePoliciesPage() {
  const { notify } = useToast();
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<LeavePolicy | 'new' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => referenceApi.leavePolicies().then(setPolicies).catch(() => undefined).finally(() => setIsLoading(false));

  useEffect(() => {
    load();
    referenceApi.leaveTypes().then(setLeaveTypes).catch(() => undefined);
  }, []);

  const handleSubmit = async (values: LeavePolicyFormValues) => {
    setSubmitting(true);
    try {
      if (editing && editing !== 'new') {
        await adminApi.updateLeavePolicy(editing.id, values);
        notify('success', 'Leave policy updated.');
      } else {
        await adminApi.createLeavePolicy(values);
        notify('success', 'Leave policy created.');
      }
      setEditing(null);
      load();
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await adminApi.deleteLeavePolicy(id);
      notify('success', `${name} was removed.`);
      load();
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'Could not remove this policy — it may still be assigned to employees.');
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Leave policies</h1>
          <p style={{ color: 'var(--color-ink-muted)' }}>Define how many days each leave type allows, and how they accrue.</p>
        </div>
        {editing === null ? (
          <Button onClick={() => setEditing('new')}>Add policy</Button>
        ) : null}
      </div>

      {editing !== null ? (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <LeavePolicyForm
            leaveTypes={leaveTypes}
            initialData={editing !== 'new' ? editing : undefined}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : null}

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <div className={styles.list}>
          {policies.map((policy) => (
            <div key={policy.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>{policy.name}</h2>
                  {policy.description ? <p className={styles.cardDescription}>{policy.description}</p> : null}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button size="sm" variant="secondary" onClick={() => setEditing(policy)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(policy.id, policy.name)}>
                    Delete
                  </Button>
                </div>
              </div>
              <table className={styles.rulesTable}>
                <caption className="visually-hidden">Rules for {policy.name}</caption>
                <thead>
                  <tr>
                    <th scope="col">Leave type</th>
                    <th scope="col">Annual days</th>
                    <th scope="col">Accrual</th>
                    <th scope="col">Max carry-forward</th>
                  </tr>
                </thead>
                <tbody>
                  {policy.rules.map((rule) => (
                    <tr key={rule.id}>
                      <td>{rule.leaveType.name}</td>
                      <td>{rule.annualDays}</td>
                      <td>{rule.accrualFrequency}</td>
                      <td>{rule.maxCarryForward}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
