'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/employees/new': 'Add Employee',
  '/attendance': 'Attendance',
  '/departments': 'Departments',
  '/my-attendance': 'My Attendance',
};

const PAGE_SUBTITLES: Record<string, string> = {
  '/dashboard': "Welcome back! Here's what's happening in your organization.",
  '/employees': 'Manage employees, roles, departments, and profile details.',
  '/employees/new': 'Create a new employee profile.',
  '/attendance': 'Track employee attendance, leaves, breaks, and absences.',
  '/departments': 'Manage company departments and team structure.',
  '/my-attendance': 'View your personal attendance history.',
};

const getTitle = (pathname: string): string => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/employees/') && pathname.endsWith('/edit')) return 'Edit Employee';
  if (pathname.startsWith('/employees/')) return 'Employee Profile';
  return 'Employee Management';
};

const getSubtitle = (pathname: string): string => {
  if (PAGE_SUBTITLES[pathname]) return PAGE_SUBTITLES[pathname];

  if (pathname.startsWith('/employees/') && pathname.endsWith('/edit')) {
    return 'Update employee information and details.';
  }

  if (pathname.startsWith('/employees/')) {
    return 'View employee profile, status, and department details.';
  }

  return 'Manage your employee management system.';
};

const Header = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const title = getTitle(pathname);
  const subtitle = getSubtitle(pathname);

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const firstInitial = user?.firstName?.[0]?.toUpperCase() ?? 'U';
  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'Employee';

  return (
    <header
      className="flex h-[70px] flex-shrink-0 items-center justify-between gap-4 border-b px-4 lg:px-5"
      style={{
        background: 'transparent',
        borderColor: 'var(--border)',
      }}
    >
      {/* Left */}
      <div className="min-w-0">
        <h2
          className="truncate text-2xl font-black leading-tight tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>

        <p
          className="mt-0.5 hidden max-w-[620px] truncate text-sm md:block"
          style={{ color: 'var(--text-muted)' }}
        >
          {subtitle}
        </p>
      </div>

      {/* Right */}
      <div className="flex flex-shrink-0 items-center gap-2.5">
        {/* User */}
        {fullName && (
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-2xl border px-2.5 transition-all hover:-translate-y-0.5 md:px-3"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
                color: '#111111',
              }}
              aria-hidden="true"
            >
              {firstInitial}
            </div>

            <div className="hidden text-left md:block">
              <p
                className="max-w-[135px] truncate text-sm font-bold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {fullName}
              </p>

              <p
                className="text-[11px] leading-tight"
                style={{ color: 'var(--text-muted)' }}
              >
                {roleLabel}
              </p>
            </div>

            <span
              className="hidden text-sm md:block"
              style={{ color: 'var(--text-muted)' }}
            >
              ⌄
            </span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;