'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAttendanceRecords } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';

type AttendanceStats = {
  present: number;
  absent: number;
  on_leave: number;
  on_break: number;
  late: number;
};

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

const STATUS_CONFIG: {
  key: keyof AttendanceStats;
  label: string;
  icon: React.ReactNode
  color: string;
  bg: string;
  border: string;
}[] = [
    {
      key: 'present',
      label: 'Present',
      icon: '✓',
      color: 'var(--success)',
      bg: 'var(--success-soft)',
      border: 'rgba(51, 199, 90, 0.28)',
    },
    {
      key: 'absent',
      label: 'Absent',
      icon: '×',
      color: 'var(--danger)',
      bg: 'var(--danger-soft)',
      border: 'rgba(255, 77, 79, 0.28)',
    },
    {
      key: 'on_leave',
      label: 'On Leave',
      icon: '↗',
      color: 'var(--info)',
      bg: 'var(--info-soft)',
      border: 'rgba(61, 162, 255, 0.28)',
    },
    {
      key: 'on_break',
      label: 'On Break',
      icon: '☕',
      color: 'var(--accent)',
      bg: 'var(--accent-soft)',
      border: 'rgba(255, 193, 7, 0.34)',
    },
    {
      key: 'late',
      label: 'Late',
      icon: '!',
      color: '#ff9f43',
      bg: 'rgba(255, 159, 67, 0.14)',
      border: 'rgba(255, 159, 67, 0.28)',
    },
  ];

const MonthlyStats = () => {
  const { accessToken } = useAuth();

  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    on_leave: 0,
    on_break: 0,
    late: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      if (!accessToken) return;

      const monthStr = `${year}-${String(month).padStart(2, '0')}`;

      setLoading(true);

      try {
        const records = await getAttendanceRecords(accessToken, monthStr);

        const nextStats: AttendanceStats = {
          present: 0,
          absent: 0,
          on_leave: 0,
          on_break: 0,
          late: 0,
        };

        records.forEach((record) => {
          if (record.status in nextStats) {
            nextStats[record.status as keyof AttendanceStats] += 1;
          }
        });

        setStats(nextStats);
      } catch {
        // Dashboard stats are non-critical.
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [year, month, accessToken]);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const total = useMemo(() => {
    return Object.values(stats).reduce((sum, value) => sum + value, 0);
  }, [stats]);

  const attendanceRate = total > 0 ? Math.round((stats.present / total) * 100) : 0;

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

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg"
            style={{
              background: 'var(--purple-soft)',
              color: 'var(--purple)',
            }}
          >
            <IconCalendar />
          </div>

          <div>
            <h3
              className="text-lg font-black leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Monthly Attendance
            </h3>

            <p
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {loading ? 'Loading attendance summary...' : `${total} records marked`}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-2xl border p-1"
          style={{
            background: 'var(--bg-surface-soft)',
            borderColor: 'var(--border)',
          }}
        >
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
            aria-label="Previous month"
          >
            ←
          </button>

          <span
            className="min-w-36 text-center text-sm font-black"
            style={{ color: 'var(--text-primary)' }}
          >
            {monthLabel}
          </span>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {STATUS_CONFIG.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border p-3"
            style={{
              background: 'var(--bg-surface-soft)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black"
                style={{
                  background: item.bg,
                  color: item.color,
                }}
              >
                {item.icon}
              </span>

              <span
                className="text-xl font-black leading-none"
                style={{ color: 'var(--text-primary)' }}
              >
                {stats[item.key]}
              </span>
            </div>

            <p
              className="mt-2 truncate text-xs font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div
        className="min-h-0 flex-1 rounded-2xl border p-4"
        style={{
          background: 'var(--bg-surface-soft)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p
              className="text-sm font-black"
              style={{ color: 'var(--text-primary)' }}
            >
              Attendance Trend
            </p>

            <p
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Present vs absent pattern for selected month
            </p>
          </div>

          <div className="text-right">
            <p
              className="text-2xl font-black leading-none"
              style={{ color: 'var(--text-primary)' }}
            >
              {attendanceRate}%
            </p>

            <p
              className="text-xs font-bold"
              style={{ color: 'var(--success)' }}
            >
              Present rate
            </p>
          </div>
        </div>

        <div className="relative h-[150px] overflow-hidden rounded-2xl">
          {/* grid lines */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(to bottom, transparent 0, transparent 29px, var(--border-soft) 30px)',
            }}
          />

          {/* green line */}
          <svg
            viewBox="0 0 520 150"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d="M0 105 L40 82 L80 90 L120 68 L160 84 L200 72 L240 105 L280 64 L320 78 L360 52 L400 88 L440 70 L480 92 L520 66"
              fill="none"
              stroke="var(--success)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M0 150 L0 105 L40 82 L80 90 L120 68 L160 84 L200 72 L240 105 L280 64 L320 78 L360 52 L400 88 L440 70 L480 92 L520 66 L520 150 Z"
              fill="var(--success)"
              opacity="0.10"
            />
          </svg>

          {/* red line */}
          <svg
            viewBox="0 0 520 150"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d="M0 118 L40 123 L80 112 L120 126 L160 116 L200 132 L240 121 L280 134 L320 118 L360 128 L400 114 L440 130 L480 120 L520 126"
              fill="none"
              stroke="var(--danger)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />

            <path
              d="M0 150 L0 118 L40 123 L80 112 L120 126 L160 116 L200 132 L240 121 L280 134 L320 118 L360 128 L400 114 L440 130 L480 120 L520 126 L520 150 Z"
              fill="var(--danger)"
              opacity="0.08"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span
              className="flex items-center gap-2 text-xs font-bold"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: 'var(--success)' }}
              />
              Present
            </span>

            <span
              className="flex items-center gap-2 text-xs font-bold"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: 'var(--danger)' }}
              />
              Absent
            </span>
          </div>

          <span
            className="rounded-full border px-3 py-1 text-xs font-bold"
            style={{
              background: attendanceRate >= 75 ? 'var(--success-soft)' : 'var(--danger-soft)',
              borderColor:
                attendanceRate >= 75
                  ? 'rgba(51, 199, 90, 0.28)'
                  : 'rgba(255, 77, 79, 0.28)',
              color: attendanceRate >= 75 ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {attendanceRate >= 75 ? 'Healthy attendance' : 'Needs attention'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStats;  