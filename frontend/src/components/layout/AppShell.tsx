import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { visibleSections } from './nav';
import styles from './AppShell.module.css';

export function AppShell() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  if (!user) return null;
  const sections = visibleSections(user.role);
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <>
      <div className={styles.shell}>
        <header className={styles.topbar}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <button
          type="button"
          className={styles.navToggle}
          aria-expanded={navOpen}
          aria-controls="primary-nav"
          onClick={() => setNavOpen((v) => !v)}
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <span className="visually-hidden">Toggle navigation menu</span>
        </button>
        <span className={styles.brand}>ELMS</span>
        <div className={styles.topbarSpacer} />
        <button type="button" className={styles.navToggle} onClick={() => {}} aria-label="Notifications">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/>
          </svg>
        </button>
        <div className={styles.userMenu}>
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className={styles.avatarPhoto}
            />
          ) : (
            <span className={styles.avatar} aria-hidden="true">
              {initials}
            </span>
          )}
          <span className={styles.userInfo}>
            <span className={styles.userName}>
              {user.firstName} {user.lastName}
            </span>
            <span className={styles.userRole}>{user.role}</span>
          </span>
          <button type="button" className={styles.logout} onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <nav
        id="primary-nav"
        aria-label="Primary"
        className={`${styles.sidebar} ${navOpen ? styles.sidebarOpen : ''}`}
      >
        {sections.map((section) => (
          <div key={section.title} className={styles.navSection}>
            <h2 className={styles.navSectionTitle}>{section.title}</h2>
            <ul className={styles.navList}>
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    onClick={() => setNavOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

        <main id="main-content" className={styles.main} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
