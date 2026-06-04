'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const ADMIN_NAV = [
  { href: '/dashboard',   label: 'Dashboard',   icon: '📊' },
  { href: '/employees',   label: 'Employees',   icon: '👥' },
  { href: '/attendance',  label: 'Attendance',  icon: '📅' },
  { href: '/departments', label: 'Departments', icon: '🏢' },
];

const EMPLOYEE_NAV = [
  { href: '/my-attendance', label: 'My Attendance', icon: '📅' },
];

export default function Sidebar() {
  const pathname         = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router           = useRouter();
  const isDark           = theme === 'dark';

  const navItems = user?.role === 'super_admin' ? ADMIN_NAV : EMPLOYEE_NAV;

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <aside
      className="w-64 min-h-screen flex flex-col flex-shrink-0"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        transition: 'background-color 0.25s ease',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--sidebar-text)' }}>
          EMS
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--sidebar-muted)' }}>
          Employee Management
        </p>
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? '#0a66c2' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--sidebar-muted)',
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'transparent';
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom: dark mode + logout ────────────────────────────── */}
      <div
        className="px-4 py-4 border-t space-y-1"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ color: 'var(--sidebar-muted)' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor =
              'rgba(255,255,255,0.08)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
          }
          aria-label="Toggle dark mode"
        >
          <span className="text-base">{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: isDark ? '#32444e' : 'rgba(255,255,255,0.12)',
              color: isDark ? '#e7e9ea' : '#9ca3af',
            }}
          >
            {isDark ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ color: 'var(--sidebar-muted)' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor =
              'rgba(255,100,100,0.15)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
          }
          aria-label="Log out"
        >
          <span className="text-base">🚪</span>
          <span>Log out</span>
        </button>

        <p className="text-xs mt-2 px-3" style={{ color: 'var(--sidebar-muted)' }}>
          v1.0.0
        </p>
      </div>
    </aside>
  );
}
