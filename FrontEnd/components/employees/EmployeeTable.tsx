'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Employee, EmployeeStatus } from '@/lib/types';
import { Department } from '@/lib/types';
import { getEmployees, getDepartments, saveEmployee, deleteEmployee } from '@/lib/store';
import { STATUS_LABELS } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  ...(['active', 'inactive', 'on_break', 'on_leave', 'absent'] as EmployeeStatus[]).map((s) => ({
    value: s,
    label: STATUS_LABELS[s],
  })),
];

export default function EmployeeTable() {
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

  const load = useCallback(async () => {
    const [empList, deptList] = await Promise.all([
      getEmployees(accessToken),
      getDepartments(accessToken),
    ]);
    setEmployees(empList);
    setDepartments(deptList);
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const roles = Array.from(new Set(employees.map((e) => e.role))).sort();

  const filtered = employees.filter((e) => {
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    if (search && !fullName.includes(search.toLowerCase())) return false;
    if (filterDept && e.departmentId !== filterDept) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    if (filterRole && e.role !== filterRole) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  async function handleStatusChange(empId: string, newStatus: EmployeeStatus) {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    await saveEmployee({ ...emp, status: newStatus }, accessToken);
    setStatusDropdown(null);
    await load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteEmployee(deleteTarget.id, accessToken);
    setDeleteTarget(null);
    await load();
  }

  function getDeptName(id: string) {
    return departments.find((d) => d.id === id)?.name ?? '—';
  }

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  const roleOptions = [
    { value: '', label: 'All Roles' },
    ...roles.map((r) => ({ value: r, label: r })),
  ];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={handleFilterChange(setSearch)}
          />
        </div>
        <div className="w-44">
          <Select
            options={deptOptions}
            value={filterDept}
            onChange={handleFilterChange(setFilterDept)}
          />
        </div>
        <div className="w-40">
          <Select
            options={roleOptions}
            value={filterRole}
            onChange={handleFilterChange(setFilterRole)}
          />
        </div>
        <div className="w-40">
          <Select
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={handleFilterChange(setFilterStatus)}
          />
        </div>
        <Link href="/employees/new">
          <Button>+ Add Employee</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  No employees found.
                </td>
              </tr>
            ) : (
              paginated.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link href={`/employees/${emp.id}`} className="hover:text-blue-600">
                      {emp.firstName} {emp.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{emp.role}</td>
                  <td className="px-4 py-3 text-gray-600">{getDeptName(emp.departmentId)}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setStatusDropdown(statusDropdown === emp.id ? null : emp.id)}
                      className="cursor-pointer"
                      aria-label="Change status"
                    >
                      <StatusBadge status={emp.status} />
                    </button>
                    {statusDropdown === emp.id && (
                      <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-32">
                        {(['active', 'inactive', 'on_break', 'on_leave', 'absent'] as EmployeeStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(emp.id, s)}
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-700"
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/employees/${emp.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(emp)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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
}
