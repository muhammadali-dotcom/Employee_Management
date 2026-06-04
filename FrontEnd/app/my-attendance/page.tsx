'use client';

// ─────────────────────────────────────────────────────────────────────────────
// app/my-attendance/page.tsx  —  EMPLOYEE SELF-SERVICE ATTENDANCE
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { getAttendanceRecords, saveAttendanceRecord } from '@/lib/store';
import { AttendanceRecord, AttendanceStatus } from '@/lib/types';
import { ATTENDANCE_COLORS, ATTENDANCE_LABELS, formatDate } from '@/lib/utils';

const STATUS_OPTIONS: AttendanceStatus[] = [
  'present', 'absent', 'on_leave', 'on_break', 'late',
];

const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const currentMonthStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const MyAttendancePage = () => {
  const { user, accessToken } = useAuth();

  const [todayRecord,    setTodayRecord]    = useState<AttendanceRecord | null>(null);
  const [monthRecords,   setMonthRecords]   = useState<AttendanceRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | ''>('');
  const [saving,         setSaving]         = useState(false);
  const [loadError,      setLoadError]      = useState('');
  const [saveError,      setSaveError]      = useState('');
  const [saveSuccess,    setSaveSuccess]    = useState(false);

  const today = todayStr();
  const month = currentMonthStr();

  const loadAttendance = useCallback(async () => {
    if (!user || !accessToken) return;
    setLoadError('');
    try {
      const records = await getAttendanceRecords(accessToken, month);
      setMonthRecords(records);
      const rec = records.find((r) => r.date === today);
      setTodayRecord(rec ?? null);
      setSelectedStatus(rec?.status ?? '');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load attendance');
    }
  }, [user, accessToken, month, today]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleStatusChange = async (status: AttendanceStatus) => {
    if (!user || !accessToken) return;

    // Optimistically update the UI immediately
    setSelectedStatus(status);
    setSaveError('');
    setSaveSuccess(false);
    setSaving(true);

    try {
      await saveAttendanceRecord(
        {
          id:         todayRecord?.id ?? '',
          employeeId: user.id,
          date:       today,
          status,
        },
        accessToken,
      );
      setSaveSuccess(true);
      await loadAttendance();
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save attendance');
      // Revert to the last known saved status
      setSelectedStatus(todayRecord?.status ?? '');
    } finally {
      setSaving(false);
    }
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <AppShell>
      <div className="max-w-lg mx-auto space-y-6">

        {/* Today's card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{fullName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Today — {new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>

          {loadError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
              {loadError}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Mark your attendance for today</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => {
                const isSelected = selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={saving}
                    aria-pressed={isSelected}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? `${ATTENDANCE_COLORS[status]} border-transparent ring-2 ring-offset-1 ring-blue-400`
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {ATTENDANCE_LABELS[status]}
                  </button>
                );
              })}
            </div>

            {saving && <p className="mt-2 text-xs text-gray-400">Saving…</p>}
            {saveSuccess && !saving && (
              <p className="mt-2 text-xs text-green-600">✓ Attendance saved</p>
            )}
            {saveError && (
              <p className="mt-2 text-xs text-red-600" role="alert">{saveError}</p>
            )}
          </div>

          {todayRecord && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-500">Current status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ATTENDANCE_COLORS[todayRecord.status]}`}>
                {ATTENDANCE_LABELS[todayRecord.status]}
              </span>
            </div>
          )}
        </div>

        {/* Monthly history */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">This month's attendance</h3>
          </div>
          {monthRecords.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">
              No attendance records this month yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {[...monthRecords]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((rec) => (
                  <li key={rec.id} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm text-gray-600">
                      {formatDate(rec.date)}
                      {rec.date === today && (
                        <span className="ml-2 text-xs text-blue-500 font-medium">Today</span>
                      )}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ATTENDANCE_COLORS[rec.status]}`}>
                      {ATTENDANCE_LABELS[rec.status]}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>

      </div>
    </AppShell>
  );
}

export default MyAttendancePage;
