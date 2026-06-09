'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import StatusBadge from '@/components/employees/StatusBadge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { getEmployee, getDepartments, deleteEmployee } from '@/lib/store';
import { Employee, Department } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const EmployeeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [emp, deptList] = await Promise.all([
      getEmployee(id, accessToken),
      getDepartments(accessToken),
    ]);

    setEmployee(emp ?? null);
    setDepartments(deptList);
    setLoading(false);
  }, [id, accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!employee) return;

    await deleteEmployee(employee.id, accessToken);
    router.push('/employees');
  };

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
              Loading employee profile...
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
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black"
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
              This employee does not exist or may have been removed.
            </p>

            <Link href="/employees" className="mt-5 inline-flex">
              <Button variant="secondary">← Back to Employees</Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const deptName =
    departments.find((department) => department.id === employee.departmentId)?.name ?? '—';

  const fields = [
    {
      label: 'Employee ID',
      value: employee.id,
      icon: '#',
      color: 'var(--accent)',
      bg: 'var(--accent-soft)',
    },
    {
      label: 'Email',
      value: employee.email,
      icon: '✉',
      color: 'var(--info)',
      bg: 'var(--info-soft)',
    },
    {
      label: 'Phone',
      value: employee.phone || '—',
      icon: '☎',
      color: 'var(--success)',
      bg: 'var(--success-soft)',
    },
    {
      label: 'Role',
      value: employee.role,
      icon: '★',
      color: 'var(--purple)',
      bg: 'var(--purple-soft)',
    },
    {
      label: 'Department',
      value: deptName,
      icon: '⌂',
      color: 'var(--accent)',
      bg: 'var(--accent-soft)',
    },
    {
      label: 'Join Date',
      value: formatDate(employee.joinDate),
      icon: '↳',
      color: 'var(--info)',
      bg: 'var(--info-soft)',
    },
  ];

  return (
    <AppShell>
      <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-4 overflow-hidden">
        {/* Profile Header */}
        <div
          className="relative overflow-hidden rounded-[var(--radius-lg)] border p-5"
          style={{
            background:
              'linear-gradient(135deg, var(--accent-soft), var(--card-bg) 45%, var(--bg-surface-soft))',
            borderColor: 'var(--border-accent)',
            boxShadow: 'var(--card-shadow)',
            backdropFilter: 'var(--blur)',
            WebkitBackdropFilter: 'var(--blur)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full blur-3xl"
            style={{ background: 'var(--accent-soft)' }}
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[1.5rem] text-2xl font-black"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
                  color: '#111111',
                  boxShadow: '0 18px 45px rgba(255, 193, 7, 0.28)',
                }}
              >
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h2
                    className="truncate text-3xl font-black leading-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {employee.firstName} {employee.lastName}
                  </h2>

                  <StatusBadge status={employee.status} />
                </div>

                <p
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {employee.role}
                </p>

                <p
                  className="mt-1 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {deptName} Department · Joined {formatDate(employee.joinDate)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/employees/${employee.id}/edit`}>
                <Button variant="secondary">Edit Profile</Button>
              </Link>

              <Button variant="danger" onClick={() => setShowDelete(true)}>
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
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
          <div className="flex h-full min-h-0 flex-col">
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: 'var(--border)' }}
            >
              <div>
                <h3
                  className="text-lg font-black"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Employee Details
                </h3>

                <p
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Personal and organization information.
                </p>
              </div>

              <span
                className="rounded-full border px-3 py-1 text-xs font-bold"
                style={{
                  background: 'var(--accent-soft)',
                  borderColor: 'var(--border-accent)',
                  color: 'var(--accent)',
                }}
              >
                Profile
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-5">
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fields.map((field) => (
                  <div
                    key={field.label}
                    className="rounded-2xl border p-4"
                    style={{
                      background: 'var(--bg-surface-soft)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black"
                        style={{
                          background: field.bg,
                          color: field.color,
                        }}
                      >
                        {field.icon}
                      </span>

                      <dt
                        className="text-xs font-black uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {field.label}
                      </dt>
                    </div>

                    <dd
                      className="break-all text-sm font-bold leading-relaxed"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {field.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    background: 'var(--bg-surface-soft)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <h4
                    className="text-sm font-black"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Account Status
                  </h4>

                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    This employee is currently marked as{' '}
                    <span className="font-bold">{employee.status.replace('_', ' ')}</span>.
                    You can update their status from the edit profile screen.
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-4"
                  style={{
                    background: 'var(--bg-surface-soft)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <h4
                    className="text-sm font-black"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Department Assignment
                  </h4>

                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Assigned to{' '}
                    <span className="font-bold">{deptName}</span>. Department details can
                    be managed from the departments module.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="flex items-center justify-between gap-3">
          <Link href="/employees">
            <Button variant="ghost">← Back to Employees</Button>
          </Link>

          <Link href={`/employees/${employee.id}/edit`}>
            <button
              type="button"
              className="rounded-xl border px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5"
              style={{
                background: 'var(--accent-soft)',
                borderColor: 'var(--border-accent)',
                color: 'var(--accent)',
              }}
            >
              Update Employee
            </button>
          </Link>
        </div>
      </div>

      <Modal
        open={showDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        danger
      />
    </AppShell>
  );
};

export default EmployeeDetailPage;