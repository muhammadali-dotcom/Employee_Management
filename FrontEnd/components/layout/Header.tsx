'use client';

import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/employees/new': 'Add Employee',
  '/attendance': 'Attendance',
  '/departments': 'Departments',
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/employees/') && pathname.endsWith('/edit')) return 'Edit Employee';
  if (pathname.startsWith('/employees/')) return 'Employee Profile';
  return 'Employee Management';
}

export default function Header() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header
      className="h-14 flex items-center px-6 border-b flex-shrink-0"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <h2
        className="text-lg font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h2>
    </header>
  );
}
