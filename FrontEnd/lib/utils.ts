import { EmployeeStatus, AttendanceStatus } from './types';

export function formatDate(dateStr: string): string {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_break: 'On Break',
  on_leave: 'On Leave',
  absent: 'Absent',
};

export const STATUS_COLORS: Record<EmployeeStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  on_break: 'bg-yellow-100 text-yellow-800',
  on_leave: 'bg-blue-100 text-blue-800',
  absent: 'bg-red-100 text-red-800',
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  on_leave: 'On Leave',
  on_break: 'On Break',
  late: 'Late',
};

export const ATTENDANCE_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  on_leave: 'bg-blue-100 text-blue-800',
  on_break: 'bg-yellow-100 text-yellow-800',
  late: 'bg-orange-100 text-orange-800',
};
