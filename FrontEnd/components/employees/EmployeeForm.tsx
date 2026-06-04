'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Employee, EmployeeStatus } from '@/lib/types';
import { Department } from '@/lib/types';
import { saveEmployee } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

const STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_break', label: 'On Break' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'absent', label: 'Absent' },
];

interface Props {
  employee?: Employee;
  departments: Department[];
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  departmentId?: string;
  status?: string;
}

export default function EmployeeForm({ employee, departments }: Props) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const isEdit = !!employee;

  const [form, setForm] = useState({
    firstName: employee?.firstName ?? '',
    lastName: employee?.lastName ?? '',
    email: employee?.email ?? '',
    phone: employee?.phone ?? '',
    role: employee?.role ?? '',
    departmentId: employee?.departmentId ?? '',
    status: (employee?.status ?? 'active') as EmployeeStatus,
    joinDate: employee?.joinDate ?? new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address';
    }
    if (!form.role.trim()) e.role = 'Role is required';
    if (!form.departmentId) e.departmentId = 'Department is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const record: Employee = {
      id: employee?.id ?? generateId(),
      ...form,
    };
    await saveEmployee(record, accessToken);
    router.push('/employees');
  }

  const deptOptions = departments.map((d) => ({ value: d.id, label: d.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="firstName"
          label="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          error={errors.firstName}
          placeholder="Muhammad"
        />
        <Input
          id="lastName"
          label="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          error={errors.lastName}
          placeholder="Ali"
        />
      </div>

      <Input
        id="email"
        label="Email Address"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        placeholder="ali@company.com"
      />

      <Input
        id="phone"
        label="Phone (optional)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="555-0101"
      />

      <Input
        id="role"
        label="Role / Job Title"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        error={errors.role}
        placeholder="Junior Engineer"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="departmentId"
          label="Department"
          value={form.departmentId}
          onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
          error={errors.departmentId}
          options={deptOptions}
          placeholder="Select department"
        />
        <Select
          id="status"
          label="Status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}
          options={STATUS_OPTIONS}
        />
      </div>

      <Input
        id="joinDate"
        label="Join Date"
        type="date"
        value={form.joinDate}
        onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit">{isEdit ? 'Save Changes' : 'Add Employee'}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
