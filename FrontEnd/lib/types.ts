export type EmployeeStatus = 'active' | 'inactive' | 'on_break' | 'on_leave' | 'absent';

export type AttendanceStatus = 'present' | 'absent' | 'on_leave' | 'on_break' | 'late';

export interface Department {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  departmentId: string;
  status: EmployeeStatus;
  joinDate: string;
  lastLoginAt?: string | Date | null;
  updatedAt?: string | Date | null;
  createdAt?: string | Date | null;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  note?: string;
}
