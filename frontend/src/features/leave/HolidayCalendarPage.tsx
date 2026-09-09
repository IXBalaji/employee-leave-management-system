import { useEffect, useState } from 'react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { referenceApi, type Holiday } from '../../lib/reference';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function HolidayCalendarPage() {
  useDocumentTitle('Holiday Calendar');
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
        Rule: button-name — button element has no accessible name
        WCAG: 4.1.2 Name, Role, Value (Level A)
      */}
      <button type="button" onClick={() => window.print()} aria-label="Print" style={{ marginBottom: 'var(--space-3)', padding: '0.4rem', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 14H8v-4h8v4zm2-4v-2H6v2H4v-4c0-.55.45-1 1 .45 1 1v4h-2z" fill="currentColor"/></svg>
      </button>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-5)' }}>Company holidays for this year.</p>
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
