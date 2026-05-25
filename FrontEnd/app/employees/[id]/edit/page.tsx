'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import EmployeeForm from '@/components/employees/EmployeeForm';
import Button from '@/components/ui/Button';
import { getEmployee, getDepartments } from '@/lib/store';
import { Employee, Department } from '@/lib/types';

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    async function loadData() {
      const [emp, deptList] = await Promise.all([
        getEmployee(id),
        getDepartments(),
      ]);
      setEmployee(emp ?? null);
      setDepartments(deptList);
    }
    loadData();
  }, [id]);

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
      </div>
    </AppShell>
  );
}
