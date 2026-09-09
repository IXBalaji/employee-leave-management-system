import { useEffect, useState } from 'react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { ApiError } from '../../lib/api';
import { referenceApi } from '../../lib/reference';
import { employeesApi } from '../employees/api';
import { adminApi } from './adminApi';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import type { Department, Employee } from '../employees/types';

export function DepartmentsPage() {
  useDocumentTitle('Departments');
  const { notify } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newHead, setNewHead] = useState('');
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editHead, setEditHead] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => referenceApi.departments().then(setDepartments).catch(() => undefined).finally(() => setIsLoading(false));

  useEffect(() => {
    load();
    employeesApi.list().then(setEmployees).catch(() => undefined);
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      notify('error', 'Enter a department name.');
      return;
    }
    setAdding(true);
    try {
      await adminApi.createDepartment({ name: newName.trim(), headEmployeeId: newHead || undefined });
      notify('success', 'Department added.');
      setNewName('');
      setNewHead('');
      load();
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (d: Department) => {
    setEditingId(d.id);
    setEditName(d.name);
    setEditHead(d.headEmployeeId ?? '');
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await adminApi.updateDepartment(id, { name: editName.trim(), headEmployeeId: editHead || undefined });
      notify('success', 'Department updated.');
      setEditingId(null);
      load();
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await adminApi.deleteDepartment(id);
      notify('success', `${name} was removed.`);
      load();
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'Could not remove this department.');
    }
  };

  const columns: Column<Department>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (d) =>
        editingId === d.id ? (
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} aria-label="Department name" />
        ) : (
          d.name
        ),
    },
    {
      key: 'head',
      header: 'Department head',
      render: (d) =>
        editingId === d.id ? (
          <Select value={editHead} onChange={(e) => setEditHead(e.target.value)} aria-label="Department head">
            <option value="">None</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </Select>
        ) : (
          employees.find((e) => e.id === d.headEmployeeId)?.firstName ? (
            `${employees.find((e) => e.id === d.headEmployeeId)?.firstName} ${employees.find((e) => e.id === d.headEmployeeId)?.lastName}`
          ) : (
            '—'
          )
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (d) =>
        editingId === d.id ? (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button size="sm" disabled={saving} onClick={() => saveEdit(d.id)}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button size="sm" variant="secondary" onClick={() => startEdit(d)}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleDelete(d.id, d.name)}>
              Delete
            </Button>
          </div>
        ),
    },
  ];

  return (
    <>
      <h1>Departments</h1>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-5)' }}>
        Manage the departments employees can be assigned to.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '12rem' }}>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Department name"
          />
        </div>
        {/*
          WCAG 2.4.4 - Link without accessible name
        */}
        <a href="/admin/departments/export" aria-label="Export departments" style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/></svg>
        </a>
        <div style={{ minWidth: '12rem' }}>
          <Field label="Department head (optional)">
            <Select value={newHead} onChange={(e) => setNewHead(e.target.value)}>
              <option value="">None</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Button disabled={adding} onClick={handleAdd}>
          {adding ? 'Adding…' : 'Add department'}
        </Button>
      </div>

      <DataTable
        caption="Departments"
        columns={columns}
        rows={departments}
        getRowKey={(d) => d.id}
        emptyMessage={isLoading ? 'Loading…' : 'No departments yet.'}
      />
    </>
  );
}
