'use client';

import { Employee, Department, AttendanceRecord } from './types';

const API_BASE_URL = 'http://localhost:4000/api';

// Helper to handle response parsing
async function handleResponse<T>(response: Response, fallback: T): Promise<T> {
  if (!response.ok) {
    return fallback;
  }
  try {
    return await response.json() as T;
  } catch {
    return fallback;
  }
}

// ── Employees ──────────────────────────────────────────────────────────────

export async function getEmployees(): Promise<Employee[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/employees`);
    return await handleResponse<Employee[]>(res, []);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

export async function getEmployee(id: string): Promise<Employee | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}/employees/${id}`);
    if (!res.ok) return undefined;
    return await res.json() as Employee;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    return undefined;
  }
}

export async function saveEmployee(employee: Employee): Promise<void> {
  try {
    // Check if employee already exists to decide between POST and PUT
    const checkRes = await fetch(`${API_BASE_URL}/employees/${employee.id}`);
    if (checkRes.ok) {
      // Update
      await fetch(`${API_BASE_URL}/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
    } else {
      // Create
      await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
    }
  } catch (error) {
    console.error('Error saving employee:', error);
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
  }
}

// ── Departments ────────────────────────────────────────────────────────────

export async function getDepartments(): Promise<Department[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/departments`);
    return await handleResponse<Department[]>(res, []);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
}

export async function saveDepartment(dept: Department): Promise<void> {
  try {
    // Check if department already exists to decide between POST and PUT
    const checkRes = await fetch(`${API_BASE_URL}/departments/${dept.id}`);
    if (checkRes.ok) {
      // Update
      await fetch(`${API_BASE_URL}/departments/${dept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dept),
      });
    } else {
      // Create
      await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dept),
      });
    }
  } catch (error) {
    console.error('Error saving department:', error);
  }
}

export async function deleteDepartment(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error deleting department ${id}:`, error);
  }
}

// ── Attendance ─────────────────────────────────────────────────────────────

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/attendance`);
    return await handleResponse<AttendanceRecord[]>(res, []);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
}

export async function saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
  try {
    // The Express backend `/api/attendance` POST endpoint performs an upsert automatically
    await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  } catch (error) {
    console.error('Error saving attendance record:', error);
  }
}
