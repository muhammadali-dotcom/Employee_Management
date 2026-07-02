'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Employee, EmployeeStatus, Department } from '@/lib/types';
import {
  getEmployees,
  getDepartments,
  saveEmployee,
  deleteEmployee,
} from '@/lib/store';
import { STATUS_LABELS } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';

const PAGE_SIZE = 10;

const STATUS_KEYS: EmployeeStatus[] = [
  'active',
  'inactive',
  'on_break',
  'on_leave',
  'absent',
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  ...STATUS_KEYS.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
];

const EmployeeTable = () => {
  const { accessToken } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage] = useState(1);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [empList, deptList] = await Promise.all([
        getEmployees(accessToken),
        getDepartments(accessToken),
      ]);

      setEmployees(empList);
      setDepartments(deptList);
    } catch {
      setEmployees([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const roles = useMemo(() => {
    return Array.from(new Set(employees.map((employee) => employee.role))).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const searchText = search.toLowerCase();

      if (
        search &&
        !fullName.includes(searchText) &&
        !employee.email.toLowerCase().includes(searchText)
      ) {
        return false;
      }

      if (filterDept && employee.departmentId !== filterDept) return false;
      if (filterStatus && employee.status !== filterStatus) return false;
      if (filterRole && employee.role !== filterRole) return false;

      return true;
    });
  }, [employees, search, filterDept, filterStatus, filterRole]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter: (value: string) => void) => {
    return (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setter(event.target.value);
      setPage(1);
    };
  };

  const handleStatusChange = async (empId: string, newStatus: EmployeeStatus) => {
    const employee = employees.find((item) => item.id === empId);
    if (!employee) return;

    await saveEmployee(
      {
        ...employee,
        status: newStatus,
      },
      accessToken,
    );

    setStatusDropdown(null);
    await load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    await deleteEmployee(deleteTarget.id, accessToken);
    setDeleteTarget(null);
    await load();
  };

  const getDeptName = (id: string) => {
    return departments.find((department) => department.id === id)?.name ?? '—';
  };

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((department) => ({
      value: department.id,
      label: department.name,
    })),
  ];

  const roleOptions = [
    { value: '', label: 'All Roles' },
    ...roles.map((role) => ({
      value: role,
      label: role,
    })),
  ];

  const clearFilters = () => {
    setSearch('');
    setFilterDept('');
    setFilterStatus('');
    setFilterRole('');
    setPage(1);
  };

  const hasFilters = search || filterDept || filterStatus || filterRole;

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-4 overflow-hidden">
      {/* Filters */}
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
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_auto]">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={handleFilterChange(setSearch)}
          />

          <Select
            options={deptOptions}
            value={filterDept}
            onChange={handleFilterChange(setFilterDept)}
          />

          <Select
            options={roleOptions}
            value={filterRole}
            onChange={handleFilterChange(setFilterRole)}
          />

          <Select
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={handleFilterChange(setFilterStatus)}
          />

          <Link href="/employees/new">
            <Button className="h-full w-full whitespace-nowrap">
              + Add Employee
            </Button>
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p
            className="text-xs font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            Showing {paginated.length} of {filtered.length} employee
            {filtered.length !== 1 ? 's' : ''}
          </p>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border px-3 py-1.5 text-xs font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--bg-surface-soft)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={load}
              className="rounded-xl border px-3 py-1.5 text-xs font-bold transition-all hover:-translate-y-0.5"
              style={{
                background: 'var(--bg-surface-soft)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Employee list */}
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
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          {/* Header row */}
          <div
            className="
              grid grid-cols-[2.2fr_1.2fr_1.1fr_1.6fr_0.9fr_1.1fr]
              items-center gap-4 border-b px-5 py-3 text-xs font-black uppercase tracking-wider
            "
            style={{
              background: 'var(--bg-surface-solid)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <div>Employee</div>
            <div>Role</div>
            <div>Department</div>
            <div>Email</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="min-h-0 flex-1 overflow-auto">
            {paginated.length === 0 ? (
              <div
                className="flex h-full items-center justify-center text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                No employees found.
              </div>
            ) : (
              paginated.map((employee, index) => {
                const rowBg =
                  index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface-soft)';

                return (
                  <div
                    key={employee.id}
                    className="
                      grid grid-cols-[2.2fr_1.2fr_1.1fr_1.6fr_0.9fr_1.1fr]
                      items-center gap-4 border-b px-5 py-4 transition-colors
                    "
                    style={{
                      background: rowBg,
                      borderColor: 'var(--border-soft)',
                    }}
                  >
                    {/* Employee */}
                    <Link
                      href={`/employees/${employee.id}`}
                      className="group flex min-w-0 items-center gap-3"
                    >
                      <div
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-black"
                        style={{
                          background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
                          color: '#111111',
                          boxShadow: '0 12px 28px rgba(255, 193, 7, 0.18)',
                        }}
                      >
                        {employee.firstName?.[0]}
                        {employee.lastName?.[0]}
                      </div>

                      <div className="min-w-0">
                        <p
                          className="truncate font-black transition-colors group-hover:text-[var(--accent)]"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {employee.firstName} {employee.lastName}
                        </p>

                        <p
                          className="truncate text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          ID: {employee.id}
                        </p>
                      </div>
                    </Link>

                    {/* Role */}
                    <div
                      className="min-w-0 text-sm font-semibold"
                      style={{ color: 'var(--text-secondary)' }}
                      title={employee.role}
                    >
                      <span className="line-clamp-2">{employee.role}</span>
                    </div>

                    {/* Department */}
                    <div className="min-w-0">
                      <span
                        className="inline-flex max-w-full rounded-full border px-3 py-1 text-xs font-bold"
                        style={{
                          background: 'var(--accent-soft)',
                          borderColor: 'var(--border-accent)',
                          color: 'var(--accent)',
                        }}
                        title={getDeptName(employee.departmentId)}
                      >
                        <span className="truncate">
                          {getDeptName(employee.departmentId)}
                        </span>
                      </span>
                    </div>

                    {/* Email */}
                    <div
                      className="min-w-0 truncate text-sm font-semibold"
                      style={{ color: 'var(--text-secondary)' }}
                      title={employee.email}
                    >
                      {employee.email}
                    </div>

                    {/* Status */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setStatusDropdown(
                            statusDropdown === employee.id ? null : employee.id,
                          )
                        }
                        className="cursor-pointer transition-all hover:-translate-y-0.5"
                        aria-label="Change status"
                      >
                        <StatusBadge status={employee.status} />
                      </button>

                      {statusDropdown === employee.id && (
                        <div
                          className="absolute left-0 top-[38px] z-40 min-w-40 overflow-hidden rounded-2xl border p-1"
                          style={{
                            background: 'var(--card-bg)',
                            borderColor: 'var(--border)',
                            boxShadow: '0 22px 60px rgba(0,0,0,0.24)',
                            backdropFilter: 'var(--blur)',
                            WebkitBackdropFilter: 'var(--blur)',
                          }}
                        >
                          {STATUS_KEYS.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(employee.id, status)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold transition-all hover:translate-x-0.5"
                              style={{
                                color:
                                  status === 'active'
                                    ? 'var(--success)'
                                    : status === 'absent'
                                      ? 'var(--danger)'
                                      : status === 'on_break'
                                        ? 'var(--accent)'
                                        : status === 'on_leave'
                                          ? 'var(--info)'
                                          : 'var(--text-muted)',
                              }}
                            >
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  background:
                                    status === 'active'
                                      ? 'var(--success)'
                                      : status === 'absent'
                                        ? 'var(--danger)'
                                        : status === 'on_break'
                                          ? 'var(--accent)'
                                          : status === 'on_leave'
                                            ? 'var(--info)'
                                            : 'var(--text-muted)',
                                }}
                              />

                              {STATUS_LABELS[status]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <Link href={`/employees/${employee.id}/edit`}>
                        <button
                          type="button"
                          className="rounded-xl border px-3 py-2 text-xs font-black transition-all hover:-translate-y-0.5"
                          style={{
                            background: 'var(--bg-surface-soft)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          Edit
                        </button>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(employee)}
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
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div
        className="rounded-[var(--radius-lg)] border px-4 py-3"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--card-shadow)',
          backdropFilter: 'var(--blur)',
          WebkitBackdropFilter: 'var(--blur)',
        }}
      >
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal
        open={!!deleteTarget}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This will also remove all their attendance records.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
};

export default EmployeeTable;