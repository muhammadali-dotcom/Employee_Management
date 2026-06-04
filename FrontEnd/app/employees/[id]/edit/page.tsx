'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import EmployeeForm from '@/components/employees/EmployeeForm';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getEmployee, getDepartments } from '@/lib/store';
import { Employee, Department } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { createApiClient } from '@/lib/api';

// ── Set Password Section ──────────────────────────────────────────────────────

const SetPasswordSection = ({ employeeId }: { employeeId: string }) => {
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [pwError,     setPwError]     = useState('');
  const [pwSuccess,   setPwSuccess]   = useState('');
  const [saving,      setSaving]      = useState(false);

  const api = useCallback(
    <T = unknown>(path: string, options?: RequestInit) =>
      createApiClient(
        () => accessToken,
        refreshAccessToken,
        async () => { await logout(); router.replace('/login'); },
      )<T>(path, options),
    [accessToken, refreshAccessToken, logout, router],
  );

  const handleSetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!newPassword || newPassword.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      await api('/api/auth/set-password', {
        method: 'POST',
        body:   JSON.stringify({ employeeId, newPassword }),
      });
      setPwSuccess('Password updated successfully');
      setNewPassword('');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Set / Reset Password</h3>
      <p className="text-xs text-gray-500 mb-4">
        Set a password so this employee can log in to the system.
      </p>
      <form onSubmit={handleSetPassword} className="flex flex-col sm:flex-row gap-3 max-w-md">
        <div className="flex-1">
          <Input
            id="newPassword"
            label=""
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPwError(''); setPwSuccess(''); }}
            placeholder="New password (min 8 chars)"
            error={pwError}
          />
        </div>
        <div className="pt-0.5">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Set Password'}
          </Button>
        </div>
      </form>
      {pwSuccess && (
        <p className="mt-2 text-sm text-green-600">{pwSuccess}</p>
      )}
    </div>
  );
}

// ── Edit Employee Page ────────────────────────────────────────────────────────

const EditEmployeePage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [emp, deptList] = await Promise.all([
        getEmployee(id, accessToken),
        getDepartments(accessToken),
      ]);
      setEmployee(emp ?? null);
      setDepartments(deptList);
    }
    loadData();
  }, [id, accessToken]);

  if (!employee) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">Employee not found.</p>
          <Link href="/employees">
            <Button variant="secondary">← Back to Employees</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Edit — {employee.firstName} {employee.lastName}
        </h2>
        <EmployeeForm employee={employee} departments={departments} />
        <SetPasswordSection employeeId={employee.id} />
      </div>
    </AppShell>
  );
}

export default EditEmployeePage;
