'use client';

// ─────────────────────────────────────────────────────────────────────────────
// lib/store.ts  —  AUTHENTICATED API CALLS
//
// All functions now accept an optional `token` parameter and attach the
// Authorization: Bearer header. Pages that call these should pass the
// accessToken from AuthContext. When no token is passed the call goes
// through unauthenticated (will 401 on protected routes — handled by callers).
// ─────────────────────────────────────────────────────────────────────────────

import { Employee, Department, AttendanceRecord } from './types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`;

const authHeaders = (token?: string | null): HeadersInit => {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

const handleResponse = async <T>(response: Response, fallback: T): Promise<T> => {
  if (!response.ok) return fallback;
  try {
    return await response.json() as T;
  } catch {
    return fallback;
  }
}

// ── Employees ──────────────────────────────────────────────────────────────

export const getEmployees = async (token?: string | null): Promise<Employee[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/employees`, {
      headers: authHeaders(token),
      credentials: 'include',
    });
    return await handleResponse<Employee[]>(res, []);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

export const getEmployee = async (id: string, token?: string | null): Promise<Employee | undefined> => {
  try {
    const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
      headers: authHeaders(token),
      credentials: 'include',
    });
    if (!res.ok) return undefined;
    return await res.json() as Employee;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    return undefined;
  }
}

export const saveEmployee = async (employee: Employee, token?: string | null): Promise<void> => {
  const checkRes = await fetch(`${API_BASE_URL}/employees/${employee.id}`, {
    headers: authHeaders(token),
    credentials: 'include',
  });

  const res = checkRes.ok
    ? await fetch(`${API_BASE_URL}/employees/${employee.id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        credentials: 'include',
        body: JSON.stringify(employee),
      })
    : await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: authHeaders(token),
        credentials: 'include',
        body: JSON.stringify(employee),
      });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to save employee (${res.status})`);
  }
}

export const deleteEmployee = async (id: string, token?: string | null): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
      credentials: 'include',
    });
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
  }
}

// ── Departments ────────────────────────────────────────────────────────────

export const getDepartments = async (token?: string | null): Promise<Department[]> => {
  const res = await fetch(`${API_BASE_URL}/departments`, {
    headers: authHeaders(token),
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch departments (${res.status})`);
  }
  return res.json() as Promise<Department[]>;
}

export const saveDepartment = async (dept: Department, token?: string | null): Promise<void> => {
  try {
    const checkRes = await fetch(`${API_BASE_URL}/departments/${dept.id}`, {
      headers: authHeaders(token),
      credentials: 'include',
    });
    if (checkRes.ok) {
      await fetch(`${API_BASE_URL}/departments/${dept.id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        credentials: 'include',
        body: JSON.stringify(dept),
      });
    } else {
      await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: authHeaders(token),
        credentials: 'include',
        body: JSON.stringify(dept),
      });
    }
  } catch (error) {
    console.error('Error saving department:', error);
  }
}

export const deleteDepartment = async (id: string, token?: string | null): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
      credentials: 'include',
    });
  } catch (error) {
    console.error(`Error deleting department ${id}:`, error);
  }
}

// ── Attendance ─────────────────────────────────────────────────────────────

export const getAttendanceRecords = async (token?: string | null, month?: string): Promise<AttendanceRecord[]> => {
  const url = month
    ? `${API_BASE_URL}/attendance?month=${month}`
    : `${API_BASE_URL}/attendance`;
  const res = await fetch(url, {
    headers:     authHeaders(token),
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch attendance (${res.status})`);
  }
  return res.json() as Promise<AttendanceRecord[]>;
}

export const saveAttendanceRecord = async (record: AttendanceRecord, token?: string | null): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/attendance`, {
    method: 'POST',
    headers: authHeaders(token),
    credentials: 'include',
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to save attendance (${res.status})`);
  }
}
