'use client';

import { useState, useEffect } from 'react';
import { getAttendanceRecords } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import StatsCard from './StatsCard';

export default function MonthlyStats() {
  const { accessToken } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [stats, setStats] = useState({ present: 0, absent: 0, on_leave: 0, on_break: 0, late: 0 });

  useEffect(() => {
    async function loadStats() {
      if (!accessToken) return;
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      try {
        const records = await getAttendanceRecords(accessToken, monthStr);
        const s = { present: 0, absent: 0, on_leave: 0, on_break: 0, late: 0 };
        records.forEach((r) => {
          if (r.status in s) s[r.status as keyof typeof s]++;
        });
        setStats(s);
      } catch {
        // silently ignore on dashboard — not critical
      }
    }
    loadStats();
  }, [year, month, accessToken]);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
        >←</button>
        <span className="text-sm font-medium min-w-36 text-center" style={{ color: 'var(--text-primary)' }}>
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
        >→</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard label="Present"  value={stats.present}  icon="✅" iconBg="#dcfce7" iconColor="#16a34a" />
        <StatsCard label="Absent"   value={stats.absent}   icon="❌" iconBg="#fee2e2" iconColor="#dc2626" />
        <StatsCard label="On Leave" value={stats.on_leave} icon="🏖️" iconBg="#dbeafe" iconColor="#2563eb" />
        <StatsCard label="On Break" value={stats.on_break} icon="☕" iconBg="#fef9c3" iconColor="#ca8a04" />
        <StatsCard label="Late"     value={stats.late}     icon="⏰" iconBg="#ffedd5" iconColor="#ea580c" />
      </div>
    </div>
  );
}
