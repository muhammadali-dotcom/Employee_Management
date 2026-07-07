'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import {
  getEmployees,
  getDepartments,
  getAttendanceRecords,
  saveAttendanceRecord,
} from '@/lib/store';
import {
  Employee,
  Department,
  AttendanceRecord,
  AttendanceStatus,
} from '@/lib/types';
import { generateId } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string; short: string }[] = [
  { value: 'present', label: 'Present', short: 'Pre' },
  { value: 'absent', label: 'Absent', short: 'Abs' },
  { value: 'on_leave', label: 'On Leave', short: 'Lea' },
  { value: 'on_break', label: 'On Break', short: 'Brk' },
  { value: 'late', label: 'Late', short: 'Lat' },
];

const IconCalendar = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
    <path d="m9 16 2 2 4-5" />
  </svg>
);

const STATUS_STYLE: Record<
  AttendanceStatus,
  { bg: string; color: string; border: string; dot: string }
> = {
  present: {
    bg: 'var(--success-soft)',
    color: 'var(--success)',
    border: 'rgba(51, 199, 90, 0.28)',
    dot: 'var(--success)',
  },
  absent: {
    bg: 'var(--danger-soft)',
    color: 'var(--danger)',
    border: 'rgba(255, 77, 79, 0.28)',
    dot: 'var(--danger)',
  },
  on_leave: {
    bg: 'var(--info-soft)',
    color: 'var(--info)',
    border: 'rgba(61, 162, 255, 0.28)',
    dot: 'var(--info)',
  },
  on_break: {
    bg: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'rgba(255, 193, 7, 0.34)',
    dot: 'var(--accent)',
  },
  late: {
    bg: 'rgba(255, 159, 67, 0.14)',
    color: '#ff9f43',
    border: 'rgba(255, 159, 67, 0.28)',
    dot: '#ff9f43',
  },
};

const getWeekdays = (year: number, month: number): string[] => {
  const days: string[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);

    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(
        `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      );
    }
  }

  return days;
};

const AttendancePage = () => {
  const { accessToken } = useAuth();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterEmp, setFilterEmp] = useState('');
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    if (!accessToken) return;

    setLoadError('');

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    try {
      const [empList, deptList, recordList] = await Promise.all([
        getEmployees(accessToken),
        getDepartments(accessToken),
        getAttendanceRecords(accessToken, monthStr),
      ]);

      setEmployees(empList);
      setDepartments(deptList);
      setRecords(recordList);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load data');
    }
  }, [accessToken, year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const weekdays = useMemo(() => getWeekdays(year, month), [year, month]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (filterDept && employee.departmentId !== filterDept) return false;
      if (filterEmp && employee.id !== filterEmp) return false;
      return true;
    });
  }, [employees, filterDept, filterEmp]);

  const recordMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();

    records.forEach((record) => {
      map.set(`${record.employeeId}-${record.date}`, record);
    });

    return map;
  }, [records]);

  const getRecord = (empId: string, date: string): AttendanceRecord | undefined => {
    return recordMap.get(`${empId}-${date}`);
  };

  const handleMark = async (
    empId: string,
    date: string,
    status: AttendanceStatus | '',
  ) => {
    if (!status) return;

    const existing = getRecord(empId, date);

    try {
      await saveAttendanceRecord(
        {
          id: existing?.id ?? generateId(),
          employeeId: empId,
          date,
          status,
        },
        accessToken,
      );

      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to save attendance');
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((department) => ({
      value: department.id,
      label: department.name,
    })),
  ];

  const empOptions = [
    { value: '', label: 'All Employees' },
    ...employees.map((employee) => ({
      value: employee.id,
      label: `${employee.firstName} ${employee.lastName}`,
    })),
  ];

  const counts = useMemo(() => {
    const result: Record<AttendanceStatus, number> = {
      present: 0,
      absent: 0,
      on_leave: 0,
      on_break: 0,
      late: 0,
    };

    records.forEach((record) => {
      result[record.status] = (result[record.status] ?? 0) + 1;
    });

    return result;
  }, [records]);

  const totalMarked = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <AppShell>
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr_auto] gap-4 overflow-hidden">
        {/* Error banner */}
        {loadError ? (
          <div
            className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
            role="alert"
            style={{
              background: 'var(--danger-soft)',
              borderColor: 'rgba(255, 77, 79, 0.28)',
              color: 'var(--danger)',
            }}
          >
            <span>{loadError}</span>

            <button
              onClick={() => setLoadError('')}
              className="ml-4 font-bold transition-opacity hover:opacity-70"
              aria-label="Close error"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="hidden" />
        )}

        {/* Top controls */}
        <div className="dashboard-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-lg"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                }}
              >
                <IconCalendar />
              </div>

              <div>
                <h2
                  className="text-lg font-black leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Attendance Register
                </h2>

                <p
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Mark daily attendance for employees.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div
                className="flex items-center justify-between gap-2 rounded-2xl border p-1 sm:justify-start"
                style={{
                  background: 'var(--bg-surface-soft)',
                  borderColor: 'var(--border)',
                }}
              >
                <button
                  type="button"
                  onClick={prevMonth}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  ←
                </button>

                <span
                  className="min-w-0 flex-1 text-center text-sm font-bold sm:min-w-40 sm:flex-none"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {monthLabel}
                </span>

                <button
                  type="button"
                  onClick={nextMonth}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:gap-3">
                <div className="w-full sm:w-44">
                  <Select
                    options={deptOptions}
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                  />
                </div>

                <div className="w-full sm:w-52">
                  <Select
                    options={empOptions}
                    value={filterEmp}
                    onChange={(e) => setFilterEmp(e.target.value)}
                  />
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={load}
                  className="w-full sm:w-auto"
                >
                  ↻ Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          <div
            className="rounded-2xl border p-3"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Employees
            </p>
            <p className="mt-1 text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              {filteredEmployees.length}
            </p>
          </div>

          {ATTENDANCE_OPTIONS.map((option) => {
            const style = STATUS_STYLE[option.value];

            return (
              <div
                key={option.value}
                className="rounded-2xl border p-3"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--card-shadow)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="truncate text-xs font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {option.label}
                  </p>

                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: style.dot }}
                  />
                </div>

                <p
                  className="mt-1 text-2xl font-black"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {counts[option.value]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Table card */}
        <div
          className="min-h-0 overflow-hidden rounded-[var(--radius-lg)] border"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--card-shadow)',
            backdropFilter: 'var(--blur)',
            WebkitBackdropFilter: 'var(--blur)',
          }}
        >
          <div className="h-full min-h-0 overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  <th
                    className="sticky left-0 top-0 z-30 min-w-52 border-b px-4 py-3 text-left font-bold"
                    style={{
                      background: 'var(--bg-surface-solid)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Employee
                  </th>

                  {weekdays.map((date) => {
                    const day = new Date(date + 'T00:00:00').getDate();
                    const weekday = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                    });

                    return (
                      <th
                        key={date}
                        className="sticky top-0 z-20 min-w-16 border-b px-2 py-3 text-center font-bold"
                        style={{
                          background: 'var(--bg-surface-solid)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span className="block text-sm leading-none">{day}</span>
                        <span
                          className="mt-1 block text-[10px] font-medium"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {weekday}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={weekdays.length + 1}
                      className="py-12 text-center text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee, employeeIndex) => (
                    <tr key={employee.id}>
                      <td
                        className="sticky left-0 z-10 border-b px-4 py-3"
                        style={{
                          background:
                            employeeIndex % 2 === 0
                              ? 'var(--bg-surface-solid)'
                              : 'var(--bg-surface-soft)',
                          borderColor: 'var(--border-soft)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-black"
                            style={{
                              background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
                              color: '#111111',
                            }}
                          >
                            {employee.firstName?.[0]}
                            {employee.lastName?.[0]}
                          </div>

                          <div className="min-w-0">
                            <p
                              className="truncate text-sm font-bold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {employee.firstName} {employee.lastName}
                            </p>

                            <p
                              className="truncate text-[11px]"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {departments.find((dept) => dept.id === employee.departmentId)?.name ??
                                'No Department'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {weekdays.map((date) => {
                        const record = getRecord(employee.id, date);
                        const statusStyle = record ? STATUS_STYLE[record.status] : null;

                        return (
                          <td
                            key={date}
                            className="border-b px-1.5 py-2 text-center"
                            style={{
                              background:
                                employeeIndex % 2 === 0
                                  ? 'var(--bg-surface)'
                                  : 'var(--bg-surface-soft)',
                              borderColor: 'var(--border-soft)',
                            }}
                          >
                            <select
                              value={record?.status ?? ''}
                              onChange={(e) =>
                                handleMark(
                                  employee.id,
                                  date,
                                  e.target.value as AttendanceStatus | '',
                                )
                              }
                              className="h-8 min-w-14 cursor-pointer rounded-xl border px-1 text-center text-[11px] font-bold outline-none transition-all focus:ring-2"
                              style={{
                                background: statusStyle?.bg ?? 'var(--bg-surface-soft)',
                                color: statusStyle?.color ?? 'var(--text-muted)',
                                borderColor: statusStyle?.border ?? 'var(--border)',
                              }}
                              aria-label={`Attendance for ${employee.firstName} on ${date}`}
                            >
                              <option value="">—</option>

                              {ATTENDANCE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.short}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {ATTENDANCE_OPTIONS.map((option) => {
              const style = STATUS_STYLE[option.value];

              return (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold"
                  style={{
                    background: style.bg,
                    borderColor: style.border,
                    color: style.color,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: style.dot }}
                  />
                  {option.label}
                </span>
              );
            })}

            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold"
              style={{
                background: 'var(--bg-surface-soft)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: 'var(--text-muted)' }}
              />
              Unmarked
            </span>
          </div>

          <p
            className="text-xs font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            {totalMarked} records marked for {monthLabel}
          </p>
        </div>
      </div>
    </AppShell>
  );
};

export default AttendancePage;