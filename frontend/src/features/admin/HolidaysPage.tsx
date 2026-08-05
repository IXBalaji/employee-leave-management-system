import { useEffect, useState } from 'react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { ApiError } from '../../lib/api';
import { referenceApi, type Holiday } from '../../lib/reference';
import { adminApi } from './adminApi';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function HolidaysPage() {
  const { notify } = useToast();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('All');
  const [adding, setAdding] = useState(false);

  const load = () => referenceApi.holidays().then(setHolidays).catch(() => undefined).finally(() => setIsLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim() || !date) {
      notify('error', 'Enter a name and date.');
      return;
    }
    setAdding(true);
    try {
      await adminApi.createHoliday({ name: name.trim(), date, location: location.trim() || 'All' });
      notify('success', 'Holiday added.');
      setName('');
      setDate('');
      setLocation('All');
      load();
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, holidayName: string) => {
    try {
      await adminApi.deleteHoliday(id);
      notify('success', `${holidayName} was removed.`);
      load();
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'Could not remove this holiday.');
    }
  };

  const columns: Column<Holiday>[] = [
    { key: 'name', header: 'Holiday', render: (h) => h.name },
    { key: 'date', header: 'Date', render: (h) => formatDate(h.date) },
    { key: 'location', header: 'Location', render: (h) => h.location },
    {
      key: 'actions',
      header: 'Actions',
      render: (h) => (
        <Button size="sm" variant="danger" onClick={() => handleDelete(h.id, h.name)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>Holidays</h1>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-5)' }}>
        Company-wide holidays shown on everyone's calendar.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '12rem' }}>
          <Field label="Holiday name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali" />
          </Field>
        </div>
        <div style={{ minWidth: '10rem' }}>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <div style={{ minWidth: '10rem' }}>
          <Field label="Location">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="All" />
          </Field>
        </div>
        <Button disabled={adding} onClick={handleAdd}>
          {adding ? 'Adding…' : 'Add holiday'}
        </Button>
      </div>

      <DataTable
        caption="Company holidays"
        columns={columns}
        rows={holidays}
        getRowKey={(h) => h.id}
        emptyMessage={isLoading ? 'Loading…' : 'No holidays added yet.'}
      />
    </div>
  );
}
