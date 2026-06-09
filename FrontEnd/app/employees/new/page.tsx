'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { getDepartments } from '@/lib/store';
import { Department } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

const NewEmployeePage = () => {
  const { accessToken } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const loadDepts = async () => {
      const deptList = await getDepartments(accessToken);
      setDepartments(deptList);
    };

    loadDepts();
  }, [accessToken]);

  return (
    <AppShell>
      <div
        className="rounded-[var(--radius-xl)] border p-4 sm:p-6"
        style={{
          background: 'var(--bg-surface, #10151c)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <h2
          className="mb-6 text-lg font-black"
          style={{ color: 'var(--text-primary)' }}
        >
          Add New Employee
        </h2>

        <EmployeeForm departments={departments} />
      </div>
    </AppShell>
  );
};

export default NewEmployeePage;