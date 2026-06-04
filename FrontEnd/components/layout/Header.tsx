'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/employees':     'Employees',
  '/employees/new': 'Add Employee',
  '/attendance':    'Attendance',
  '/departments':   'Departments',
  '/my-attendance': 'My Attendance',
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/employees/') && pathname.endsWith('/edit')) return 'Edit Employee';
  if (pathname.startsWith('/employees/')) return 'Employee Profile';
  return 'Employee Management';
}

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = getTitle(pathname);

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b flex-shrink-0"
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

      {fullName && (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
            style={{ backgroundColor: '#0a66c2' }}
            aria-hidden="true"
          >
            {user?.firstName?.[0]?.toUpperCase()}
          </div>
          <span
            className="text-sm font-medium hidden sm:block"
            style={{ color: 'var(--text-secondary)' }}
          >
            {fullName}
          </span>
        </div>
      )}
    </header>
  );
}
