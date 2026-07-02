'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import {
  getDepartments,
  saveDepartment,
  deleteDepartment,
  getEmployees,
} from '@/lib/store';
import { Department, Employee } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const DEPARTMENT_COLORS = [
  '#ffc107',
  '#ff9f43',
  '#33c75a',
  '#3da2ff',
  '#7c5cff',
  '#ff4d4f',
];

const IconDepartments = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-6h6v6" />
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
  </svg>
);

const IconAssignedStaff = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconProduction = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 21h18" />
    <path d="M5 21V10l4 3v-3l4 3v-3l6 4v7" />
    <path d="M9 17h.01" />
    <path d="M13 17h.01" />
    <path d="M17 17h.01" />
  </svg>
);

const IconAverage = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 3v18h18" />
    <path d="M7 16v-4" />
    <path d="M12 16V8" />
    <path d="M17 16v-6" />
  </svg>
);

const DepartmentsPage = () => {
  const { accessToken } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [nameError, setNameError] = useState('');

  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const load = useCallback(async () => {
    try {
      const [deptList, empList] = await Promise.all([
        getDepartments(accessToken),
        getEmployees(accessToken),
      ]);

      setDepartments(deptList);
      setEmployees(empList);
    } catch {
      setDepartments([]);
      setEmployees([]);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const getEmpCount = (deptId: string) => {
    return employees.filter((employee) => employee.departmentId === deptId).length;
  };

  const totalAssignedEmployees = useMemo(() => {
    return employees.filter((employee) => employee.departmentId).length;
  }, [employees]);

  const largestDepartment = useMemo(() => {
    if (departments.length === 0) return null;

    return [...departments].sort(
      (a, b) => getEmpCount(b.id) - getEmpCount(a.id),
    )[0];
  }, [departments, employees]);

  const averageEmployeesPerDept =
    departments.length > 0
      ? Math.round(totalAssignedEmployees / departments.length)
      : 0;

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newName.trim()) {
      setNameError('Name is required');
      return;
    }

    const exists = departments.some(
      (department) =>
        department.name.toLowerCase() === newName.trim().toLowerCase(),
    );

    if (exists) {
      setNameError('A department with this name already exists');
      return;
    }

    await saveDepartment(
      {
        id: generateId(),
        name: newName.trim(),
        description: newDesc.trim(),
        createdAt: new Date().toISOString().split('T')[0],
      },
      accessToken,
    );

    setNewName('');
    setNewDesc('');
    setNameError('');

    await load();
  };

  const handleRename = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editTarget) return;

    if (!editName.trim()) {
      setEditError('Name is required');
      return;
    }

    const exists = departments.some(
      (department) =>
        department.id !== editTarget.id &&
        department.name.toLowerCase() === editName.trim().toLowerCase(),
    );

    if (exists) {
      setEditError('A department with this name already exists');
      return;
    }

    await saveDepartment(
      {
        ...editTarget,
        name: editName.trim(),
      },
      accessToken,
    );

    setEditTarget(null);
    setEditName('');
    setEditError('');

    await load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    await deleteDepartment(deleteTarget.id, accessToken);
    setDeleteTarget(null);

    await load();
  };

  const affectedCount = deleteTarget ? getEmpCount(deleteTarget.id) : 0;

  return (
    <AppShell>
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-4 overflow-hidden">
        {/* Summary */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {/* Departments */}
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Departments
                </p>

                <h3
                  className="mt-1 text-3xl font-black"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {departments.length}
                </h3>
              </div>

              <span
                className="flex h-12 w-12 items-center justify-center"
                style={{ color: 'var(--accent)' }}
              >
                <IconDepartments />
              </span>
            </div>
          </div>

          {/* Assigned Staff */}
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Assigned Staff
                </p>

                <h3
                  className="mt-1 text-3xl font-black"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {totalAssignedEmployees}
                </h3>
              </div>

              <span
                className="flex h-12 w-12 items-center justify-center"
                style={{ color: 'var(--success)' }}
              >
                <IconAssignedStaff />
              </span>
            </div>
          </div>

          {/* Largest Team / Production */}
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
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Largest Team
                </p>

                <h3
                  className="mt-1 truncate text-xl font-black"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {largestDepartment?.name ?? '—'}
                </h3>

                <p
                  className="text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {largestDepartment
                    ? `${getEmpCount(largestDepartment.id)} employees`
                    : 'No data'}
                </p>
              </div>

              <span
                className="flex h-12 w-12 items-center justify-center"
                style={{ color: 'var(--info)' }}
              >
                <IconProduction />
              </span>
            </div>
          </div>

          {/* Avg Per Department */}
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Avg. Per Dept
                </p>

                <h3
                  className="mt-1 text-3xl font-black"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {averageEmployeesPerDept}
                </h3>
              </div>

              <span
                className="flex h-12 w-12 items-center justify-center"
                style={{ color: 'var(--purple)' }}
              >
                <IconAverage />
              </span>
            </div>
          </div>
        </div>

        {/* Add Department */}
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3
                className="text-lg font-black"
                style={{ color: 'var(--text-primary)' }}
              >
                Add Department
              </h3>

              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Create and organize company teams.
              </p>
            </div>

            <span
              className="hidden rounded-full border px-3 py-1 text-xs font-bold sm:inline-flex"
              style={{
                background: 'var(--accent-soft)',
                borderColor: 'var(--border-accent)',
                color: 'var(--accent)',
              }}
            >
              Quick Create
            </span>
          </div>

          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto]"
          >
            <Input
              placeholder="Department name"
              value={newName}
              onChange={(event) => {
                setNewName(event.target.value);
                setNameError('');
              }}
              error={nameError}
            />

            <Input
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(event) => setNewDesc(event.target.value)}
            />

            <Button type="submit">Add Department</Button>
          </form>
        </div>

        {/* Department Table */}
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
                  Department List
                </h3>

                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {departments.length} department
                  {departments.length !== 1 ? 's' : ''} available
                </p>
              </div>

              <button
                type="button"
                onClick={load}
                className="rounded-xl border px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--bg-surface-soft)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                ↻ Refresh
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th
                      className="sticky top-0 z-10 border-b px-5 py-3 text-left text-xs font-black uppercase tracking-wider"
                      style={{
                        background: 'var(--bg-surface-solid)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Department
                    </th>

                    <th
                      className="sticky top-0 z-10 border-b px-5 py-3 text-left text-xs font-black uppercase tracking-wider"
                      style={{
                        background: 'var(--bg-surface-solid)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Description
                    </th>

                    <th
                      className="sticky top-0 z-10 border-b px-5 py-3 text-left text-xs font-black uppercase tracking-wider"
                      style={{
                        background: 'var(--bg-surface-solid)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Employees
                    </th>

                    <th
                      className="sticky top-0 z-10 border-b px-5 py-3 text-right text-xs font-black uppercase tracking-wider"
                      style={{
                        background: 'var(--bg-surface-solid)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        No departments yet.
                      </td>
                    </tr>
                  ) : (
                    departments.map((department, index) => {
                      const employeeCount = getEmpCount(department.id);
                      const color =
                        DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length];
                      const isEditing = editTarget?.id === department.id;

                      return (
                        <tr key={department.id}>
                          <td
                            className="border-b px-5 py-4"
                            style={{
                              background:
                                index % 2 === 0
                                  ? 'var(--bg-surface)'
                                  : 'var(--bg-surface-soft)',
                              borderColor: 'var(--border-soft)',
                            }}
                          >
                            {isEditing ? (
                              <form
                                onSubmit={handleRename}
                                className="flex min-w-[360px] items-start gap-2"
                              >
                                <div className="flex-1">
                                  <Input
                                    value={editName}
                                    onChange={(event) => {
                                      setEditName(event.target.value);
                                      setEditError('');
                                    }}
                                    error={editError}
                                  />
                                </div>

                                <Button type="submit" size="sm">
                                  Save
                                </Button>

                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setEditTarget(null);
                                    setEditName('');
                                    setEditError('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </form>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span
                                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-black"
                                  style={{
                                    background: `${color}22`,
                                    color,
                                  }}
                                >
                                  {department.name?.[0]?.toUpperCase() ?? 'D'}
                                </span>

                                <div>
                                  <p
                                    className="font-black"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    {department.name}
                                  </p>

                                  <p
                                    className="text-xs"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    Created {department.createdAt ?? '—'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </td>

                          <td
                            className="border-b px-5 py-4"
                            style={{
                              background:
                                index % 2 === 0
                                  ? 'var(--bg-surface)'
                                  : 'var(--bg-surface-soft)',
                              borderColor: 'var(--border-soft)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            <span className="line-clamp-2">
                              {department.description || '—'}
                            </span>
                          </td>

                          <td
                            className="border-b px-5 py-4"
                            style={{
                              background:
                                index % 2 === 0
                                  ? 'var(--bg-surface)'
                                  : 'var(--bg-surface-soft)',
                              borderColor: 'var(--border-soft)',
                            }}
                          >
                            <span
                              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black"
                              style={{
                                background: 'var(--accent-soft)',
                                borderColor: 'var(--border-accent)',
                                color: 'var(--accent)',
                              }}
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: 'var(--accent)' }}
                              />
                              {employeeCount}
                            </span>
                          </td>

                          <td
                            className="border-b px-5 py-4 text-right"
                            style={{
                              background:
                                index % 2 === 0
                                  ? 'var(--bg-surface)'
                                  : 'var(--bg-surface-soft)',
                              borderColor: 'var(--border-soft)',
                            }}
                          >
                            {!isEditing && (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditTarget(department);
                                    setEditName(department.name);
                                    setEditError('');
                                  }}
                                  className="rounded-xl border px-3 py-2 text-xs font-black transition-all hover:-translate-y-0.5"
                                  style={{
                                    background: 'var(--bg-surface-soft)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                  }}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(department)}
                                  className="rounded-xl border px-3 py-2 text-xs font-black transition-all hover:-translate-y-0.5"
                                  style={{
                                    background: 'var(--danger-soft)',
                                    borderColor: 'rgba(255, 77, 79, 0.28)',
                                    color: 'var(--danger)',
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={!!deleteTarget}
        title="Delete Department"
        message={
          affectedCount > 0
            ? `This department has ${affectedCount} employee(s). Deleting it will unassign them. Are you sure?`
            : `Are you sure you want to delete "${deleteTarget?.name}"?`
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </AppShell>
  );
};

export default DepartmentsPage;