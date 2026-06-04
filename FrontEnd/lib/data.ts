import { Department, Employee, AttendanceRecord } from './types';

export const departments: Department[] = [
  { id: 'd1', name: 'Engineering', description: 'Software development and infrastructure', createdAt: '2023-01-01' },
  { id: 'd2', name: 'Human Resources', description: 'Recruitment, onboarding, and employee relations', createdAt: '2023-01-01' },
  { id: 'd3', name: 'Sales', description: 'Revenue generation and client management', createdAt: '2023-01-01' },
  { id: 'd4', name: 'Marketing', description: 'Brand, campaigns, and growth', createdAt: '2023-01-01' },
  { id: 'd5', name: 'Finance', description: 'Accounting, budgeting, and reporting', createdAt: '2023-01-01' },
  { id: 'd6', name: 'Operations', description: 'Day-to-day business operations', createdAt: '2023-01-01' },
];

export const employees: Employee[] = [
  { id: 'e1', firstName: 'Alice', lastName: 'Johnson', email: 'alice@company.com', phone: '555-0101', role: 'Senior Engineer', departmentId: 'd1', status: 'active', joinDate: '2021-03-15' },
  { id: 'e2', firstName: 'Bob', lastName: 'Smith', email: 'bob@company.com', phone: '555-0102', role: 'Product Manager', departmentId: 'd1', status: 'active', joinDate: '2020-07-01' },
  { id: 'e3', firstName: 'Carol', lastName: 'Williams', email: 'carol@company.com', phone: '555-0103', role: 'HR Manager', departmentId: 'd2', status: 'on_leave', joinDate: '2019-11-20' },
  { id: 'e4', firstName: 'David', lastName: 'Brown', email: 'david@company.com', phone: '555-0104', role: 'Sales Executive', departmentId: 'd3', status: 'active', joinDate: '2022-01-10' },
  { id: 'e5', firstName: 'Eva', lastName: 'Davis', email: 'eva@company.com', phone: '555-0105', role: 'Marketing Lead', departmentId: 'd4', status: 'on_break', joinDate: '2021-06-05' },
  { id: 'e6', firstName: 'Frank', lastName: 'Miller', email: 'frank@company.com', phone: '555-0106', role: 'Accountant', departmentId: 'd5', status: 'active', joinDate: '2020-02-14' },
  { id: 'e7', firstName: 'Grace', lastName: 'Wilson', email: 'grace@company.com', phone: '555-0107', role: 'Operations Manager', departmentId: 'd6', status: 'absent', joinDate: '2018-09-30' },
  { id: 'e8', firstName: 'Henry', lastName: 'Moore', email: 'henry@company.com', phone: '555-0108', role: 'Junior Engineer', departmentId: 'd1', status: 'active', joinDate: '2023-04-01' },
  { id: 'e9', firstName: 'Iris', lastName: 'Taylor', email: 'iris@company.com', phone: '555-0109', role: 'Recruiter', departmentId: 'd2', status: 'active', joinDate: '2022-08-22' },
  { id: 'e10', firstName: 'Jack', lastName: 'Anderson', email: 'jack@company.com', phone: '555-0110', role: 'Sales Executive', departmentId: 'd3', status: 'inactive', joinDate: '2019-05-17' },
  { id: 'e11', firstName: 'Karen', lastName: 'Thomas', email: 'karen@company.com', phone: '555-0111', role: 'Designer', departmentId: 'd4', status: 'active', joinDate: '2021-12-01' },
  { id: 'e12', firstName: 'Leo', lastName: 'Jackson', email: 'leo@company.com', phone: '555-0112', role: 'Finance Analyst', departmentId: 'd5', status: 'on_leave', joinDate: '2020-10-08' },
];

const generateAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const statuses: AttendanceRecord['status'][] = ['present', 'present', 'present', 'absent', 'on_leave', 'on_break', 'late'];
  let idCounter = 1;
  employees.forEach((emp) => {
    for (let day = 1; day <= today.getDate(); day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const status = statuses[(idCounter + day) % statuses.length];
      records.push({
        id: `att-${idCounter++}`,
        employeeId: emp.id,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        status,
        checkIn: status === 'present' || status === 'late' ? '09:00' : undefined,
        checkOut: status === 'present' || status === 'late' ? '17:00' : undefined,
      });
    }
  });
  return records;
}

export const attendanceRecords: AttendanceRecord[] = generateAttendance();
