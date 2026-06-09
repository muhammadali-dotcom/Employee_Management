'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const api = useCallback(
    <T = unknown>(path: string, options?: RequestInit) =>
      createApiClient(
        () => accessToken,
        refreshAccessToken,
        async () => {
          await logout();
          router.replace('/login');
        },
      )<T>(path, options),
    [accessToken, refreshAccessToken, logout, router],
  );

  const handleSetPassword = async (event: FormEvent) => {
    event.preventDefault();

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
        body: JSON.stringify({ employeeId, newPassword }),
      });

      setPwSuccess('Password updated successfully');
      setNewPassword('');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="mt-6 rounded-[var(--radius-lg)] border p-5"
      style={{
        background: 'var(--bg-surface-soft)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-lg"
            style={{
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
            }}
          >
            🔐
          </span>

          <div>
            <h3
              className="text-base font-black"
              style={{ color: 'var(--text-primary)' }}
            >
              Set / Reset Password
            </h3>

            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Set a password so this employee can log in to the system.
            </p>
          </div>
        </div>

        <span
          className="hidden rounded-full border px-3 py-1 text-xs font-bold sm:inline-flex"
          style={{
            background: 'var(--accent-soft)',
            borderColor: 'var(--border-accent)',
            color: 'var(--accent)',
          }}
        >
          Security
        </span>
      </div>

      <form
        onSubmit={handleSetPassword}
        className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]"
      >
        <Input
          id="newPassword"
          label=""
          type="password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            setPwError('');
            setPwSuccess('');
          }}
          placeholder="New password (min 8 chars)"
          error={pwError}
        />

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Set Password'}
        </Button>
      </form>

      {pwSuccess && (
        <p
          className="mt-3 rounded-xl border px-3 py-2 text-sm font-semibold"
          style={{
            background: 'var(--success-soft)',
            borderColor: 'rgba(51, 199, 90, 0.28)',
            color: 'var(--success)',
          }}
        >
          {pwSuccess}
        </p>
      )}
    </div>
  );
};

// ── Edit Employee Page ────────────────────────────────────────────────────────

const EditEmployeePage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const [emp, deptList] = await Promise.all([
        getEmployee(id, accessToken),
        getDepartments(accessToken),
      ]);

      setEmployee(emp ?? null);
      setDepartments(deptList);
      setLoading(false);
    };

    loadData();
  }, [id, accessToken]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <div
            className="rounded-[var(--radius-lg)] border px-6 py-5 text-center"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div
              className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-2xl"
              style={{ background: 'var(--accent-soft)' }}
            />

            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--text-muted)' }}
            >
              Loading employee details...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!employee) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <div
            className="max-w-md rounded-[var(--radius-lg)] border p-8 text-center"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
              backdropFilter: 'var(--blur)',
              WebkitBackdropFilter: 'var(--blur)',
            }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
              style={{
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
              }}
            >
              !
            </div>

            <h2
              className="text-xl font-black"
              style={{ color: 'var(--text-primary)' }}
            >
              Employee not found
            </h2>

            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              The employee you are trying to edit does not exist or may have been removed.
            </p>

            <Link href="/employees" className="mt-5 inline-flex">
              <Button variant="secondary">← Back to Employees</Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-4 overflow-hidden">
        {/* Page summary card */}
        <div
          className="rounded-[var(--radius-lg)] border p-4"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--card-shadow)',
            backdropFilter: 'var(--blur)',
            WebkitBackdropFilter: 'var(--blur)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
                  color: '#111111',
                  boxShadow: '0 16px 35px rgba(255, 193, 7, 0.24)',
                }}
              >
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </div>

              <div>
                <h2
                  className="text-xl font-black leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Edit — {employee.firstName} {employee.lastName}
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Update employee profile, department, role, and account access.
                </p>
              </div>
            </div>

            <Link href={`/employees/${employee.id}`}>
              <button
                type="button"
                className="rounded-xl border px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--bg-surface-soft)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                View Profile
              </button>
            </Link>
          </div>
        </div>

        {/* Form card */}
        <div
          className="min-h-0 overflow-hidden rounded-[var(--radius-lg)] border"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--card-shadow)',
            backdropFilter: 'var(--blur)',
            WebkitBackdropFilter: 'var(--blur)',
          }}
        >
          <div className="h-full min-h-0 overflow-auto p-5">
            <EmployeeForm employee={employee} departments={departments} />

            <SetPasswordSection employeeId={employee.id} />
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default EditEmployeePage;