import { useEffect, useState } from 'react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { referenceApi, type Holiday } from '../../lib/reference';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function HolidayCalendarPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    referenceApi
      .holidays()
      .then(setHolidays)
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const columns: Column<Holiday>[] = [
    { key: 'name', header: 'Holiday', render: (h) => h.name },
    { key: 'date', header: 'Date', render: (h) => formatDate(h.date) },
    { key: 'location', header: 'Location', render: (h) => h.location },
  ];

  return (
    <div>
      <h1>Holiday calendar</h1>
      {/*
        INTENTIONAL A11Y VIOLATION: Authorized accessibility testing fixture.
        Violation: 4/5
        Rule: color-contrast
        Test: src/scan/tests/employee.spec.ts / holiday calendar
      */}
      <p style={{ color: '#4b5245', marginBottom: 'var(--space-5)' }}>Company holidays for this year.</p>
      <DataTable
        caption="Company holidays"
        columns={columns}
        rows={holidays}
        getRowKey={(h) => h.id}
        emptyMessage={isLoading ? 'Loading…' : 'No holidays have been added yet.'}
      />
    </div>
  );
}
