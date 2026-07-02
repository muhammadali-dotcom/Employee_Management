'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import StatsCard from '@/components/dashboard/StatsCard';
import StatusBadge from '@/components/employees/StatusBadge';
import { getEmployees, getDepartments } from '@/lib/store';
import { Employee, EmployeeStatus, Department } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import RecentActivity from '@/components/dashboard/Recentactivity';

const IconUsers = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconCoffee = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 2v2" />
    <path d="M14 2v2" />
    <path d="M16 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" />
    <path d="M6 22h12" />
  </svg>
);

const IconLeave = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19h16" />
    <path d="M6 19c1.5-4 4.5-7 9-8" />
    <path d="M8 12c2-4 5-6 9-7" />
    <path d="M17 5c1 4-.5 8-5 10" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const IconPause = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 5v14" />
    <path d="M16 5v14" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
    <path d="m9 16 2 2 4-5" />
  </svg>
);

const STAT_CONFIG: {
  key: EmployeeStatus | 'total';
  label: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}[] = [
    {
      key: 'total',
      label: 'Present',
      icon: <IconUsers />,
      iconBg: 'transparent',
      iconColor: '#7c5cff',
    },
    {
      key: 'active',
      label: 'Active',
      icon: <IconCheck />,
      iconBg: 'transparent',
      iconColor: '#33c75a',
    },
    {
      key: 'on_break',
      label: 'On Break',
      icon: <IconCoffee />,
      iconBg: 'transparent',
      iconColor: '#ffc107',
    },
    {
      key: 'on_leave',
      label: 'On Leave',
      icon: <IconLeave />,
      iconBg: 'transparent',
      iconColor: '#3da2ff',
    },
    {
      key: 'absent',
      label: 'Absent',
      icon: <IconX />,
      iconBg: 'transparent',
      iconColor: '#ff4d4f',
    },
    {
      key: 'inactive',
      label: 'Inactive',
      icon: <IconPause />,
      iconBg: 'transparent',
      iconColor: '#94a3b8',
    },
  ];

const DEPARTMENT_COLORS = [
  '#ffc107',
  '#ff9f43',
  '#33c75a',
  '#3da2ff',
  '#7c5cff',
  '#9ca3af',
];

const CompactSparkline = ({
  color,
  height = 56,
}: {
  color: string;
  height?: number;
}) => {
  return (
    <svg
      viewBox="0 0 520 120"
      preserveAspectRatio="none"
      className="h-full w-full"
      style={{ minHeight: height }}
    >
      <path
        d="M0 88 L35 72 L70 80 L105 62 L140 76 L175 69 L210 93 L245 58 L280 71 L315 48 L350 78 L385 66 L420 84 L455 52 L490 70 L520 61"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M0 120 L0 88 L35 72 L70 80 L105 62 L140 76 L175 69 L210 93 L245 58 L280 71 L315 48 L350 78 L385 66 L420 84 L455 52 L490 70 L520 61 L520 120 Z"
        fill={color}
        opacity="0.10"
      />
    </svg>
  );
};

const MonthlyAttendancePanel = ({
  counts,
  monthLabel,
}: {
  counts: Record<string, number>;
  monthLabel: string;
}) => {
  const summary: {
    label: string;
    value: number;
    icon: ReactNode;
    color: string;
  }[] = [
      {
        label: 'Present',
        value: counts.active ?? 0,
        icon: <IconCheck />,
        color: 'var(--success)',
      },
      {
        label: 'Absent',
        value: counts.absent ?? 0,
        icon: <IconX />,
        color: 'var(--danger)',
      },
      {
        label: 'On Leave',
        value: counts.on_leave ?? 0,
        icon: <IconLeave />,
        color: 'var(--info)',
      },
      {
        label: 'On Break',
        value: counts.on_break ?? 0,
        icon: <IconCoffee />,
        color: 'var(--accent)',
      },
      {
        label: 'Inactive',
        value: counts.inactive ?? 0,
        icon: <IconPause />,
        color: '#94a3b8',
      },
    ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center"
            style={{ color: 'var(--purple)' }}
          >
            <IconCalendar />
          </span>

          <div>
            <h2
              className="text-base font-bold leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Monthly Attendance
            </h2>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {monthLabel}
            </p>
          </div>
        </div>

        <button
          className="rounded-xl border px-3 py-2 text-xs font-semibold"
          style={{
            background: 'var(--bg-surface-soft)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          This Month
        </button>
      </div>

      <div className="mb-3 grid grid-cols-5 gap-2">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border px-2 py-3"
            style={{
              background: 'var(--bg-surface-soft)',
              borderColor: 'var(--border-soft)',
            }}
          >
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <span
                className="flex h-7 w-7 items-center justify-center"
                style={{ color: item.color }}
              >
                {item.icon}
              </span>

              <p
                className="text-[10px] font-bold leading-tight"
                style={{ color: 'var(--text-muted)' }}
              >
                {item.label}
              </p>

              <p
                className="text-sm font-black leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col rounded-2xl border p-3"
        style={{
          background: 'var(--bg-surface-soft)',
          borderColor: 'var(--border-soft)',
        }}
      >
        <div className="mb-2 flex items-center gap-5 text-xs">
          <span
            className="flex items-center gap-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: 'var(--success)' }}
            />
            Present
          </span>

          <span
            className="flex items-center gap-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: 'var(--danger)' }}
            />
            Absent
          </span>
        </div>

        <div className="relative min-h-0 flex-1">
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background:
                'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, var(--border-soft) 32px)',
            }}
          />

          <div className="absolute inset-0">
            <CompactSparkline color="var(--success)" />
          </div>

          <div className="absolute inset-x-0 bottom-1 h-[45%]">
            <CompactSparkline color="var(--danger)" />
          </div>
        </div>

        <div
          className="mt-2 grid grid-cols-6 text-[10px]"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>Start</span>
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
          <span className="text-right">End</span>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { accessToken } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeFilter, setActiveFilter] = useState<EmployeeStatus | 'total' | null>(null);

  useEffect(() => {
    if (!accessToken) {
      console.log('No access token yet, skipping dashboard API call');
      return;
    }

    const loadData = async () => {
      let empList: Employee[];
      let deptList: Department[];

      try {
        [empList, deptList] = await Promise.all([
          getEmployees(accessToken),
          getDepartments(accessToken),
        ]);
      } catch {
        setEmployees([]);
        setDepartments([]);
        return;
      }

      console.log(
        'Employees from API:',
        empList.map((e) => {
          const employee = e as Employee & {
            lastLoginAt?: string | Date | null;
            updatedAt?: string | Date | null;
            createdAt?: string | Date | null;
            last_login_at?: string | Date | null;
            updated_at?: string | Date | null;
            created_at?: string | Date | null;
          };

          return {
            id: employee.id,
            name: `${employee.firstName} ${employee.lastName}`,
            status: employee.status,
            lastLoginAt: employee.lastLoginAt,
            updatedAt: employee.updatedAt,
            createdAt: employee.createdAt,
            last_login_at: employee.last_login_at,
            updated_at: employee.updated_at,
            created_at: employee.created_at,
          };
        })
      );

      setEmployees(empList);
      setDepartments(deptList);
    };

    loadData();
  }, [accessToken]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {
      total: employees.length,
      active: 0,
      on_break: 0,
      on_leave: 0,
      absent: 0,
      inactive: 0,
    };

    employees.forEach((employee) => {
      result[employee.status] = (result[employee.status] ?? 0) + 1;
    });

    return result;
  }, [employees]);

  const departmentBreakdown = useMemo(() => {
    return departments.map((department, index) => {
      const total = employees.filter(
        (employee) => employee.departmentId === department.id,
      ).length;

      const percentage =
        employees.length > 0 ? Math.round((total / employees.length) * 100) : 0;

      return {
        ...department,
        total,
        percentage,
        color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
      };
    });
  }, [departments, employees]);

  const currentMonthLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const filteredEmployees =
    activeFilter === null
      ? []
      : activeFilter === 'total'
        ? employees
        : employees.filter((employee) => employee.status === activeFilter);

  const drawerTitle =
    activeFilter === 'total'
      ? 'All Employees'
      : activeFilter
        ? STATUS_LABELS[activeFilter as EmployeeStatus]
        : '';

  const getDeptName = (id: string) => {
    return departments.find((department) => department.id === id)?.name ?? '—';
  };

  const handleCardClick = (key: EmployeeStatus | 'total') => {
    setActiveFilter((prev) => (prev === key ? null : key));
  };

  return (
    <AppShell>
      <div className="relative grid h-full min-h-0 grid-rows-[auto_1fr] gap-4 overflow-hidden">
        <div className="grid grid-cols-6 gap-3">
          {STAT_CONFIG.map((cfg) => (
            <StatsCard
              key={cfg.key}
              label={cfg.label}
              value={counts[cfg.key] ?? 0}
              total={counts.total}
              icon={cfg.icon}
              iconBg={cfg.iconBg}
              iconColor={cfg.iconColor}
              active={activeFilter === cfg.key}
              onClick={() => handleCardClick(cfg.key)}
            />
          ))}
        </div>

        {activeFilter !== null && (
          <div
            className="absolute left-0 right-0 top-[150px] z-30 mx-auto max-h-[430px] w-[92%] overflow-hidden rounded-[var(--radius-lg)] border"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border-accent)',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.30)',
              backdropFilter: 'var(--blur)',
              WebkitBackdropFilter: 'var(--blur)',
            }}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <h3
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {drawerTitle}
                </h3>

                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: 'var(--bg-hover)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {filteredEmployees.length} employee
                  {filteredEmployees.length !== 1 ? 's' : ''}
                </span>
              </div>

              <button
                onClick={() => setActiveFilter(null)}
                className="text-lg leading-none transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {filteredEmployees.length === 0 ? (
              <div
                className="py-12 text-center text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                No employees in this category.
              </div>
            ) : (
              <div className="max-h-[350px] overflow-auto">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between border-b px-5 py-3 transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border-soft)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--accent), #ffdc63)',
                          color: '#111111',
                        }}
                      >
                        {emp.firstName?.[0]}
                        {emp.lastName?.[0]}
                      </div>

                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {emp.firstName} {emp.lastName}
                        </p>

                        <p
                          className="text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {emp.role} · {getDeptName(emp.departmentId)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={emp.status} />

                      <Link
                        href={`/employees/${emp.id}`}
                        className="text-xs font-semibold"
                        style={{ color: 'var(--accent)' }}
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

        <div className="grid min-h-0 grid-cols-12 gap-4 overflow-hidden">
          <div className="dashboard-card col-span-6 h-full min-h-0 overflow-hidden p-4">
            <MonthlyAttendancePanel counts={counts} monthLabel={currentMonthLabel} />
          </div>

          <div className="dashboard-card col-span-3 h-full min-h-0 overflow-hidden p-4">
            <div className="flex h-full min-h-0 flex-col">
              <h2
                className="mb-3 text-base font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Department Breakdown
              </h2>

              <div className="flex min-h-0 flex-1 flex-col items-center justify-between gap-3">
                <div
                  className="relative flex h-40 w-40 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(
                      #ffc107 0deg 115deg,
                      #ff9f43 115deg 194deg,
                      #33c75a 194deg 259deg,
                      #3da2ff 259deg 302deg,
                      #7c5cff 302deg 331deg,
                      #9ca3af 331deg 360deg
                    )`,
                    boxShadow: '0 16px 35px rgba(255, 193, 7, 0.18)',
                  }}
                >
                  <div
                    className="flex h-24 w-24 flex-col items-center justify-center rounded-full border"
                    style={{
                      background: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <span
                      className="text-2xl font-bold leading-none"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {employees.length}
                    </span>

                    <span
                      className="mt-1 text-center text-[10px] leading-tight"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Total Employees
                    </span>
                  </div>
                </div>

                <div className="w-full space-y-2 overflow-hidden">
                  {departmentBreakdown.slice(0, 5).map((department) => (
                    <div
                      key={department.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ background: department.color }}
                        />

                        <span
                          className="truncate text-xs font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {department.name}
                        </span>
                      </div>

                      <span
                        className="whitespace-nowrap text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {department.total} ({department.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/departments"
                  className="rounded-xl border px-4 py-2 text-xs font-semibold"
                  style={{
                    background: 'var(--bg-surface-soft)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  View All Departments
                </Link>
              </div>
            </div>
          </div>

          <div className="dashboard-card col-span-3 h-full min-h-0 overflow-hidden p-4">
            <RecentActivity employees={employees} />
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardPage;