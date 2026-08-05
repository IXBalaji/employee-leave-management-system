import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import styles from './Tabs.module.css';

export interface TabDef {
  id: string;
  label: string;
  /** Count of validation errors within this tab's fields, shown as a badge. */
  errorCount?: number;
}

interface TabsProps {
  label: string;
  tabs: TabDef[];
  activeId: string;
  onChange: (id: string) => void;
  idPrefix: string;
}

/** WAI-ARIA tablist: roving tabindex, Arrow/Home/End keyboard support. */
export function Tabs({ label, tabs, activeId, onChange, idPrefix }: TabsProps) {
  const refs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const focusTab = (id: string) => {
    onChange(id);
    refs.current.get(id)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((t) => t.id === activeId);
    if (index === -1) return;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusTab(tabs[(index + 1) % tabs.length].id);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusTab(tabs[(index - 1 + tabs.length) % tabs.length].id);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusTab(tabs[0].id);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusTab(tabs[tabs.length - 1].id);
    }
  };

  return (
    <div role="tablist" aria-label={label} className={styles.tablist} onKeyDown={handleKeyDown}>
      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) refs.current.set(tab.id, el);
            }}
            id={`${idPrefix}-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={`${styles.tab} ${selected ? styles.tabActive : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {tab.errorCount ? (
              <span className={styles.badge} aria-label={`${tab.errorCount} error${tab.errorCount > 1 ? 's' : ''}`}>
                {tab.errorCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeId: string;
  idPrefix: string;
  children: ReactNode;
}

export function TabPanel({ id, activeId, idPrefix, children }: TabPanelProps) {
  // Hidden (not unmounted) when inactive: unmounting would destroy any
  // registered form fields inside it, silently dropping whatever the user
  // typed in that tab the moment they switch away from it.
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${id}`}
      aria-labelledby={`${idPrefix}-tab-${id}`}
      tabIndex={0}
      className={styles.panel}
      hidden={id !== activeId}
    >
      {children}
    </div>
  );
}
