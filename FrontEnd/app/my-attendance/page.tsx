'use client';

// ─────────────────────────────────────────────────────────────────────────────
// app/my-attendance/page.tsx  —  EMPLOYEE SELF-SERVICE ATTENDANCE
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { getAttendanceRecords, saveAttendanceRecord } from '@/lib/store';
import { AttendanceRecord, AttendanceStatus } from '@/lib/types';
import { ATTENDANCE_LABELS, formatDate } from '@/lib/utils';

const STATUS_OPTIONS: AttendanceStatus[] = [
  'present',
  'absent',
  'on_leave',
  'on_break',
  'late',
];

const STATUS_STYLE: Record<
  AttendanceStatus,
  { icon: string; bg: string; color: string; border: string; dot: string }
> = {
  present: {
    icon: '✓',
    bg: 'var(--success-soft)',
    color: 'var(--success)',
    border: 'rgba(51, 199, 90, 0.28)',
    dot: 'var(--success)',
  },
  absent: {
    icon: '×',
    bg: 'var(--danger-soft)',
    color: 'var(--danger)',
    border: 'rgba(255, 77, 79, 0.28)',
    dot: 'var(--danger)',
  },
  on_leave: {
    icon: '↗',
    bg: 'var(--info-soft)',
    color: 'var(--info)',
    border: 'rgba(61, 162, 255, 0.28)',
    dot: 'var(--info)',
  },
  on_break: {
    icon: '☕',
    bg: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'rgba(255, 193, 7, 0.34)',
    dot: 'var(--accent)',
  },
  late: {
    icon: '!',
    bg: 'rgba(255, 159, 67, 0.14)',
    color: '#ff9f43',
    border: 'rgba(255, 159, 67, 0.28)',
    dot: '#ff9f43',
  },
};

const todayStr = (): string => {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
};

const currentMonthStr = (): string => {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const MyAttendancePage = () => {
  const { user, accessToken } = useAuth();

  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [monthRecords, setMonthRecords] = useState<AttendanceRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | ''>('');
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const today = todayStr();
  const month = currentMonthStr();

  const loadAttendance = useCallback(async () => {
    if (!user || !accessToken) return;

    setLoadError('');

    try {
      const records = await getAttendanceRecords(accessToken, month);
      setMonthRecords(records);

      const record = records.find((item) => item.date === today);

      setTodayRecord(record ?? null);
      setSelectedStatus(record?.status ?? '');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load attendance');
    }
  }, [user, accessToken, month, today]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleStatusChange = async (status: AttendanceStatus) => {
    if (!user || !accessToken) return;

    setSelectedStatus(status);
    setSaveError('');
    setSaveSuccess(false);
    setSaving(true);

    try {
      await saveAttendanceRecord(
        {
          id: todayRecord?.id ?? '',
          employeeId: user.id,
          date: today,
          status,
        },
        accessToken,
      );

      setSaveSuccess(true);
      await loadAttendance();

      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save attendance');
      setSelectedStatus(todayRecord?.status ?? '');
    } finally {
      setSaving(false);
    }
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  const todayLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sortedRecords = useMemo(() => {
    return [...monthRecords].sort((a, b) => b.date.localeCompare(a.date));
  }, [monthRecords]);

  const counts = useMemo(() => {
    const result: Record<AttendanceStatus, number> = {
      present: 0,
      absent: 0,
      on_leave: 0,
      on_break: 0,
      late: 0,
    };

    monthRecords.forEach((record) => {
      result[record.status] = (result[record.status] ?? 0) + 1;
    });

    return result;
  }, [monthRecords]);

  const attendanceRate =
    monthRecords.length > 0
      ? Math.round((counts.present / monthRecords.length) * 100)
      : 0;

  const currentStatusStyle = todayRecord ? STATUS_STYLE[todayRecord.status] : null;

  return (
    <AppShell>
      <div className="grid h-full min-h-0 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[1fr_420px]">
        {/* Left section */}
        <div className="grid min-h-0 grid-rows-[auto_auto_1fr] gap-4 overflow-hidden">
          {/* Hero */}
          <div
            className="relative overflow-hidden rounded-[var(--radius-lg)] border p-5"
            style={{
              background:
                'linear-gradient(135deg, var(--accent-soft), var(--card-bg) 46%, var(--bg-surface-soft))',
              borderColor: 'var(--border-accent)',
              boxShadow: 'var(--card-shadow)',
              backdropFilter: 'var(--blur)',
              WebkitBackdropFilter: 'var(--blur)',
            }}
          >
            <div
              className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full blur-3xl"
              style={{ background: 'var(--accent-soft)' }}
            />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.4rem] text-xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
                    color: '#111111',
                    boxShadow: '0 18px 45px rgba(255, 193, 7, 0.28)',
                  }}
                >
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>

                <div>
                  <h2
                    className="text-2xl font-black leading-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {fullName || 'My Attendance'}
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Today — {todayLabel}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full border px-3 py-1 text-xs font-bold"
                      style={{
                        background: currentStatusStyle?.bg ?? 'var(--bg-surface-soft)',
                        borderColor: currentStatusStyle?.border ?? 'var(--border)',
                        color: currentStatusStyle?.color ?? 'var(--text-muted)',
                      }}
                    >
                      {todayRecord
                        ? `Current: ${ATTENDANCE_LABELS[todayRecord.status]}`
                        : 'Not marked yet'}
                    </span>

                    {saveSuccess && !saving && (
                      <span
                        className="rounded-full border px-3 py-1 text-xs font-bold"
                        style={{
                          background: 'var(--success-soft)',
                          borderColor: 'rgba(51, 199, 90, 0.28)',
                          color: 'var(--success)',
                        }}
                      >
                        ✓ Attendance saved
                      </span>
                    )}

                    {saving && (
                      <span
                        className="rounded-full border px-3 py-1 text-xs font-bold"
                        style={{
                          background: 'var(--bg-surface-soft)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Saving…
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl border px-5 py-4 text-center"
                style={{
                  background: 'var(--bg-surface-soft)',
                  borderColor: 'var(--border)',
                }}
              >
                <p
                  className="text-3xl font-black leading-none"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {attendanceRate}%
                </p>

                <p
                  className="mt-1 text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Monthly Rate
                </p>
              </div>
            </div>
          </div>

          {/* Errors */}
          {(loadError || saveError) && (
            <div
              className="rounded-2xl border px-4 py-3 text-sm font-semibold"
              role="alert"
              style={{
                background: 'var(--danger-soft)',
                borderColor: 'rgba(255, 77, 79, 0.28)',
                color: 'var(--danger)',
              }}
            >
              {loadError || saveError}
            </div>
          )}

          {/* Mark attendance */}
          <div
            className="min-h-0 rounded-[var(--radius-lg)] border p-5"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
              backdropFilter: 'var(--blur)',
              WebkitBackdropFilter: 'var(--blur)',
            }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3
                  className="text-lg font-black"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Mark your attendance
                </h3>

                <p
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Choose your current status for today.
                </p>
              </div>

              <span
                className="hidden rounded-full border px-3 py-1 text-xs font-bold sm:inline-flex"
                style={{
                  background: 'var(--accent-soft)',
                  borderColor: 'var(--border-accent)',
                  color: 'var(--accent)',
                }}
              >
                Self Service
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {STATUS_OPTIONS.map((status) => {
                const style = STATUS_STYLE[status];
                const isSelected = selectedStatus === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    disabled={saving}
                    aria-pressed={isSelected}
                    className="group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${style.bg}, var(--card-bg))`
                        : 'var(--bg-surface-soft)',
                      borderColor: isSelected ? style.border : 'var(--border)',
                      boxShadow: isSelected
                        ? `0 16px 35px ${style.bg}`
                        : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-base font-black transition-transform group-hover:scale-105"
                        style={{
                          background: style.bg,
                          color: style.color,
                        }}
                      >
                        {style.icon}
                      </span>

                      {isSelected && (
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background: style.dot,
                            boxShadow: `0 0 0 5px ${style.bg}`,
                          }}
                        />
                      )}
                    </div>

                    <p
                      className="mt-4 text-base font-black"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {ATTENDANCE_LABELS[status]}
                    </p>

                    <p
                      className="mt-1 text-xs font-semibold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Tap to mark as {ATTENDANCE_LABELS[status].toLowerCase()}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right section: monthly history */}
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
          <div className="flex h-full min-h-0 flex-col">
            <div
              className="border-b px-5 py-4"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3
                    className="text-lg font-black"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    This Month
                  </h3>

                  <p
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {monthRecords.length} attendance record{monthRecords.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <span
                  className="rounded-full border px-3 py-1 text-xs font-bold"
                  style={{
                    background: 'var(--accent-soft)',
                    borderColor: 'var(--border-accent)',
                    color: 'var(--accent)',
                  }}
                >
                  {month}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div
              className="grid grid-cols-2 gap-3 border-b p-4"
              style={{ borderColor: 'var(--border)' }}
            >
              {STATUS_OPTIONS.map((status) => {
                const style = STATUS_STYLE[status];

                return (
                  <div
                    key={status}
                    className="rounded-2xl border p-3"
                    style={{
                      background: 'var(--bg-surface-soft)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: style.dot }}
                      />

                      <span
                        className="text-lg font-black leading-none"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {counts[status]}
                      </span>
                    </div>

                    <p
                      className="mt-2 truncate text-xs font-bold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {ATTENDANCE_LABELS[status]}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* History */}
            <div className="min-h-0 flex-1 overflow-auto">
              {monthRecords.length === 0 ? (
                <div className="flex h-full items-center justify-center p-6 text-center">
                  <div>
                    <div
                      className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                      style={{
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                      }}
                    >
                      📅
                    </div>

                    <p
                      className="text-sm font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      No records yet
                    </p>

                    <p
                      className="mt-1 text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Your attendance records will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <ul>
                  {sortedRecords.map((record, index) => {
                    const style = STATUS_STYLE[record.status];
                    const isToday = record.date === today;

                    return (
                      <li
                        key={record.id || `${record.date}-${index}`}
                        className="flex items-center justify-between gap-3 border-b px-5 py-3"
                        style={{
                          borderColor: 'var(--border-soft)',
                          background:
                            index % 2 === 0
                              ? 'var(--bg-surface)'
                              : 'var(--bg-surface-soft)',
                        }}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-black"
                            style={{
                              background: style.bg,
                              color: style.color,
                            }}
                          >
                            {style.icon}
                          </span>

                          <div className="min-w-0">
                            <p
                              className="truncate text-sm font-bold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {formatDate(record.date)}
                            </p>

                            <p
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {isToday ? 'Today' : 'Attendance record'}
                            </p>
                          </div>
                        </div>

                        <span
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
                          {ATTENDANCE_LABELS[record.status]}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default MyAttendancePage;