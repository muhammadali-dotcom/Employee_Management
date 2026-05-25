'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import StatsCard from '@/components/dashboard/StatsCard';
import MonthlyStats from '@/components/dashboard/MonthlyStats';
import StatusBadge from '@/components/employees/StatusBadge';
import { getEmployees, getDepartments } from '@/lib/store';
import { Employee, EmployeeStatus, Department } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/utils';

// Config for each stat card
const STAT_CONFIG: {
  key: EmployeeStatus | 'total';
  label: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}[] = [
  { key: 'total',    label: 'Total Employees', icon: '👥', iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { key: 'active',   label: 'Active',          icon: '✅', iconBg: '#dcfce7', iconColor: '#16a34a' },
  { key: 'on_break', label: 'On Break',         icon: '☕', iconBg: '#fef9c3', iconColor: '#ca8a04' },
  { key: 'on_leave', label: 'On Leave',         icon: '🏖️', iconBg: '#dbeafe', iconColor: '#2563eb' },
  { key: 'absent',   label: 'Absent',           icon: '❌', iconBg: '#fee2e2', iconColor: '#dc2626' },
  { key: 'inactive', label: 'Inactive',         icon: '⏸️', iconBg: '#f3f4f6', iconColor: '#6b7280' },
];

export default function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeFilter, setActiveFilter] = useState<EmployeeStatus | 'total' | null>(null);

  useEffect(() => {
    async function loadData() {
      const [empList, deptList] = await Promise.all([
        getEmployees(),
        getDepartments(),
      ]);
      setEmployees(empList);
      setDepartments(deptList);
    }
    loadData();
  }, []);

  // Count per status
  const counts: Record<string, number> = { total: employees.length };
  (['active', 'on_break', 'on_leave', 'absent', 'inactive'] as EmployeeStatus[]).forEach((s) => {
    counts[s] = employees.filter((e) => e.status === s).length;
  });

  // Filtered employees for the drawer
  const filteredEmployees =
    activeFilter === null
      ? []
      : activeFilter === 'total'
      ? employees
      : employees.filter((e) => e.status === activeFilter);

  function getDeptName(id: string) {
    return departments.find((d) => d.id === id)?.name ?? '—';
  }

  function handleCardClick(key: EmployeeStatus | 'total') {
    // clicking the same card again closes the drawer
    setActiveFilter((prev) => (prev === key ? null : key));
  }

  const drawerTitle =
    activeFilter === 'total'
      ? 'All Employees'
      : activeFilter
      ? STATUS_LABELS[activeFilter as EmployeeStatus]
      : '';

  return (
    <AppShell>
      <div className="space-y-8">

        {/* ── Overview stat cards ─────────────────────────────────── */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}>
            Overview — click a card to see employees
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {STAT_CONFIG.map((cfg) => (
              <StatsCard
                key={cfg.key}
                label={cfg.label}
                value={counts[cfg.key] ?? 0}
                icon={cfg.icon}
                iconBg={cfg.iconBg}
                iconColor={cfg.iconColor}
                active={activeFilter === cfg.key}
                onClick={() => handleCardClick(cfg.key)}
              />
            ))}
          </div>
        </div>

        {/* ── Employee drawer (shows when a card is clicked) ───────── */}
        {activeFilter !== null && (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {drawerTitle}
                </h3>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setActiveFilter(null)}
                className="text-lg leading-none transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Employee list */}
            {filteredEmployees.length === 0 ? (
              <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                No employees in this category.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between px-5 py-3 transition-colors"
                    style={{ backgroundColor: 'var(--bg-surface)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface)')}
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: '#0a66c2', color: '#ffffff' }}
                      >
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {emp.role} · {getDeptName(emp.departmentId)}
                        </p>
                      </div>
                    </div>

                    {/* Right side: badge + link */}
                    <div className="flex items-center gap-3">
                      <StatusBadge status={emp.status} />
                      <Link
                        href={`/employees/${emp.id}`}
                        className="text-xs font-medium transition-colors"
                        style={{ color: '#0a66c2' }}
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Monthly attendance ───────────────────────────────────── */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}>
            Monthly Attendance
          </h3>
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <MonthlyStats />
          </div>
        </div>

      </div>
    </AppShell>
  );
}
