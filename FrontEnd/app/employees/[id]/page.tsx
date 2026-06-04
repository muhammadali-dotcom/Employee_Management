'use client';

import { useEffect, useState } from 'react';
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

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    async function loadData() {
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
          <p className="text-gray-500 text-lg mb-4">Employee not found.</p>
          <Link href="/employees">
            <Button variant="secondary">← Back to Employees</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const deptName = departments.find((d) => d.id === employee.departmentId)?.name ?? '—';

  async function handleDelete() {
    await deleteEmployee(employee!.id, accessToken);
    router.push('/employees');
  }

  const fields = [
    { label: 'Employee ID', value: employee.id },
    { label: 'Email', value: employee.email },
    { label: 'Phone', value: employee.phone || '—' },
    { label: 'Role', value: employee.role },
    { label: 'Department', value: deptName },
    { label: 'Join Date', value: formatDate(employee.joinDate) },
  ];

  return (
    <AppShell>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-gray-500 mt-1">{employee.role}</p>
              <div className="mt-3">
                <StatusBadge status={employee.status} />
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/employees/${employee.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Button variant="danger" onClick={() => setShowDelete(true)}>Delete</Button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-xs text-gray-500 mb-0.5">{f.label}</dt>
                <dd className="text-sm font-medium text-gray-900 break-all">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-4">
          <Link href="/employees">
            <Button variant="ghost">← Back to Employees</Button>
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
}
