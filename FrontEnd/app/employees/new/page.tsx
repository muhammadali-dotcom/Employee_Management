'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { getDepartments } from '@/lib/store';
import { Department } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function NewEmployeePage() {
  const { accessToken } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    async function loadDepts() {
      const deptList = await getDepartments(accessToken);
      setDepartments(deptList);
    }
    loadDepts();
  }, [accessToken]);

  return (
    <AppShell>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Add New Employee</h2>
        <EmployeeForm departments={departments} />
      </div>
    </AppShell>
  );
}
