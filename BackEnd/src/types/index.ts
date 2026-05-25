// ─────────────────────────────────────────────────────────────────────────────
// src/types/index.ts  —  SHARED TYPESCRIPT TYPES
//
// These are the TypeScript types used across the backend.
// Similar to lib/types.ts in the frontend.
// ─────────────────────────────────────────────────────────────────────────────

export type EmployeeStatus = 'active' | 'inactive' | 'on_break' | 'on_leave' | 'absent';

export type AttendanceStatus = 'present' | 'absent' | 'on_leave' | 'on_break' | 'late';

// Shape of data when creating a new employee (id is not required — DB generates it)
export interface CreateEmployeeInput {
  firstName:    string;
  lastName:     string;
  email:        string;
  phone?:       string;
  role:         string;
  departmentId?: string;
  status?:      EmployeeStatus;
  joinDate:     string;
}

// Shape of data when updating an employee (all fields optional)
export interface UpdateEmployeeInput {
  firstName?:    string;
  lastName?:     string;
  email?:        string;
  phone?:        string;
  role?:         string;
  departmentId?: string;
  status?:       EmployeeStatus;
  joinDate?:     string;
}

export interface CreateDepartmentInput {
  name:         string;
  description?: string;
}

export interface CreateAttendanceInput {
  employeeId: string;
  date:       string;
  status:     AttendanceStatus;
  checkIn?:   string;
  checkOut?:  string;
  note?:      string;
}
