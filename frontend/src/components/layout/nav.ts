import type { Role } from '../../features/auth/AuthContext';

export interface NavItem {
  to: string;
  label: string;
  roles?: Role[];
}

export const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/profile', label: 'My Profile' },
    ],
  },
  {
    title: 'People',
    items: [
      { to: '/employees', label: 'Employees', roles: ['HR', 'ADMIN'] },
      { to: '/team', label: 'My Team', roles: ['MANAGER', 'HR', 'ADMIN'] },
    ],
  },
  {
    title: 'Leave',
    items: [
      { to: '/leave/apply', label: 'Apply for Leave' },
      { to: '/leave/history', label: 'My Leave History' },
      { to: '/leave/approvals', label: 'Approvals', roles: ['MANAGER', 'HR', 'ADMIN'] },
      { to: '/leave/calendar', label: 'Holiday Calendar' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { to: '/admin/departments', label: 'Departments', roles: ['HR', 'ADMIN'] },
      { to: '/admin/leave-policies', label: 'Leave Policies', roles: ['HR', 'ADMIN'] },
      { to: '/admin/holidays', label: 'Holidays', roles: ['HR', 'ADMIN'] },
    ],
  },
];

export function visibleSections(role: Role) {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);
}
