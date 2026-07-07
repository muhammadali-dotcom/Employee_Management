'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
  </svg>
);

const IconEmployees = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconAttendance = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
    <path d="m9 16 2 2 4-5" />
  </svg>
);

const IconDepartments = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-6h6v6" />
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
  </svg>
);

const IconMoon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconSun = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const ADMIN_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
  { href: '/employees', label: 'Employees', icon: <IconEmployees /> },
  { href: '/attendance', label: 'Attendance', icon: <IconAttendance /> },
  { href: '/departments', label: 'Departments', icon: <IconDepartments /> },
];

const EMPLOYEE_NAV = [
  { href: '/my-attendance', label: 'My Attendance', icon: <IconAttendance /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const isDark = theme === 'dark';
  const navItems = user?.role === 'super_admin' ? ADMIN_NAV : EMPLOYEE_NAV;

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const firstInitial = user?.firstName?.[0]?.toUpperCase() ?? 'U';
  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'Employee';

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/55 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-full w-[260px] max-w-[82vw] flex-shrink-0 flex-col
          overflow-hidden border p-4 transition-transform duration-300 ease-in-out
          sm:w-[280px]
          lg:static lg:z-auto lg:w-[280px] lg:max-w-none lg:translate-x-0 lg:rounded-[var(--radius-xl)]
          ${mobileOpen ? 'translate-x-0 rounded-r-[var(--radius-xl)]' : '-translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(180deg, var(--sidebar-bg), var(--bg-surface-soft))',
          borderColor: 'var(--border)',
          color: 'var(--sidebar-text)',
          boxShadow: 'var(--card-shadow)',
          backdropFilter: 'var(--blur)',
          WebkitBackdropFilter: 'var(--blur)',
          transition: 'background-color 0.25s ease, border-color 0.25s ease, transform 0.3s ease-in-out',
        }}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border lg:hidden"
          style={{
            background: 'var(--bg-surface-soft)',
            borderColor: 'var(--border)',
            color: 'var(--sidebar-text)',
          }}
          aria-label="Close menu"
        >
          <IconClose />
        </button>

        {/* Logo */}
        <div
        className="relative overflow-hidden rounded-3xl border p-4"
        style={{
          background: 'linear-gradient(135deg, var(--accent-soft), rgba(255,255,255,0.04))',
          borderColor: 'var(--border-accent)',
        }}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
          style={{ background: 'var(--accent-soft)' }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
              color: '#111111',
              boxShadow: '0 16px 35px rgba(255, 193, 7, 0.28)',
            }}
          >
            E
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--sidebar-text)' }}>
              EMS
            </h1>
            <p className="text-xs font-medium" style={{ color: 'var(--sidebar-muted)' }}>
              Employee Management
            </p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div
        className="mt-4 rounded-3xl border p-3"
        style={{
          background: 'var(--bg-surface-soft)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
              color: '#111111',
            }}
          >
            {firstInitial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold" style={{ color: 'var(--sidebar-text)' }}>
              {fullName}
            </p>
            <p className="truncate text-xs" style={{ color: 'var(--sidebar-muted)' }}>
              {roleLabel}
            </p>
          </div>

          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: 'var(--success)',
              boxShadow: '0 0 0 4px var(--success-soft)',
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1 space-y-2">
        <p
          className="px-3 text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: 'var(--sidebar-muted)' }}
        >
          Menu
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--sidebar-muted)',
                border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                boxShadow: isActive ? '0 14px 30px rgba(255, 193, 7, 0.16)' : 'none',
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}

              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center transition-colors duration-300"
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--sidebar-muted)',
                }}
              >
                {item.icon}
              </span>

              <span className="flex-1">{item.label}</span>

              {isActive && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: 'var(--bg-surface-soft)',
            borderColor: 'var(--border)',
            color: 'var(--sidebar-text)',
          }}
          aria-label="Toggle dark mode"
        >
          <span
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center"
            style={{
              color: isDark ? 'var(--accent)' : 'var(--sidebar-muted)',
            }}
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </span>

          <span className="flex-1 text-left">{isDark ? 'Light Mode' : 'Dark Mode'}</span>

          <span
            className="relative h-6 w-11 rounded-full transition-all"
            style={{
              background: isDark ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <span
              className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all"
              style={{
                left: isDark ? '22px' : '4px',
              }}
            />
          </span>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: 'var(--danger-soft)',
            borderColor: 'rgba(255, 77, 79, 0.24)',
            color: 'var(--danger)',
          }}
          aria-label="Log out"
        >
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
            <IconLogout />
          </span>

          <span>Log out</span>
        </button>

        <p className="px-3 text-center text-xs" style={{ color: 'var(--sidebar-muted)' }}>
          v1.0.1
        </p>
      </div>
      </aside>
    </>
  );
};

export default Sidebar; 