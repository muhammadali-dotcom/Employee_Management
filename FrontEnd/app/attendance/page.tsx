'use client';

import { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { getEmployees, getDepartments, getAttendanceRecords, saveAttendanceRecord } from '@/lib/store';
import { Employee, Department, AttendanceRecord, AttendanceStatus } from '@/lib/types';
import { ATTENDANCE_COLORS, generateId } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'present',  label: 'Present'  },
  { value: 'absent',   label: 'Absent'   },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'on_break', label: 'On Break' },
  { value: 'late',     label: 'Late'     },
];

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
}

const AttendancePage = () => {
  const { accessToken } = useAuth();
  const now = new Date();

  const [year,        setYear]        = useState(now.getFullYear());
  const [month,       setMonth]       = useState(now.getMonth() + 1);
  const [employees,   setEmployees]   = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [records,     setRecords]     = useState<AttendanceRecord[]>([]);
  const [filterDept,  setFilterDept]  = useState('');
  const [filterEmp,   setFilterEmp]   = useState('');
  const [loadError,   setLoadError]   = useState('');

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

  useEffect(() => { load(); }, [load]);

  const weekdays = getWeekdays(year, month);

  const filteredEmployees = employees.filter((e) => {
    if (filterDept && e.departmentId !== filterDept) return false;
    if (filterEmp  && e.id !== filterEmp)            return false;
    return true;
  });

  const getRecord = (empId: string, date: string): AttendanceRecord | undefined => {
    return records.find((r) => r.employeeId === empId && r.date === date);
  }

  const handleMark = async (empId: string, date: string, status: AttendanceStatus) => {
    const existing = getRecord(empId, date);
    try {
      await saveAttendanceRecord(
        { id: existing?.id ?? generateId(), employeeId: empId, date, status },
        accessToken,
      );
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to save attendance');
    }
  }

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  }

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];
  const empOptions = [
    { value: '', label: 'All Employees' },
    ...employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` })),
  ];

  return (
    <AppShell>
      <div className="space-y-4">

        {/* Error banner */}
        {loadError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between" role="alert">
            <span>{loadError}</span>
            <button onClick={() => setLoadError('')} className="ml-4 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={prevMonth}>←</Button>
            <span className="text-sm font-medium text-gray-700 min-w-36 text-center">{monthLabel}</span>
            <Button variant="secondary" size="sm" onClick={nextMonth}>→</Button>
          </div>
          <div className="w-44">
            <Select options={deptOptions} value={filterDept} onChange={(e) => setFilterDept(e.target.value)} />
          </div>
          <div className="w-52">
            <Select options={empOptions} value={filterEmp} onChange={(e) => setFilterEmp(e.target.value)} />
          </div>
          <Button variant="secondary" size="sm" onClick={load}>↻ Refresh</Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="text-xs min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-40">
                  Employee
                </th>
                {weekdays.map((d) => (
                  <th key={d} className="px-2 py-3 font-medium text-gray-500 text-center min-w-10">
                    {new Date(d + 'T00:00:00').getDate()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={weekdays.length + 1} className="text-center py-10 text-gray-400">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900 sticky left-0 bg-white">
                      {emp.firstName} {emp.lastName}
                    </td>
                    {weekdays.map((date) => {
                      const rec = getRecord(emp.id, date);
                      return (
                        <td key={date} className="px-1 py-2 text-center">
                          <select
                            value={rec?.status ?? ''}
                            onChange={(e) =>
                              handleMark(emp.id, date, e.target.value as AttendanceStatus)
                            }
                            className={`text-xs rounded px-1 py-0.5 border-0 cursor-pointer
                              focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                              rec ? ATTENDANCE_COLORS[rec.status] : 'bg-gray-100 text-gray-400'
                            }`}
                            aria-label={`Attendance for ${emp.firstName} on ${date}`}
                          >
                            <option value="">—</option>
                            {ATTENDANCE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label.slice(0, 3)}
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

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {ATTENDANCE_OPTIONS.map((opt) => (
            <span
              key={opt.value}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ATTENDANCE_COLORS[opt.value]}`}
            >
              {opt.label}
            </span>
          ))}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
            — Unmarked
          </span>
        </div>

      </div>
    </AppShell>
  );
}

export default AttendancePage;
