'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Employee, EmployeeStatus } from '@/lib/types';
import { Department } from '@/lib/types';
import { saveEmployee } from '@/lib/store';
import { generateId, todayIso } from '@/lib/utils';
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
  phone?: string;
  role?: string;
  departmentId?: string;
  status?: string;
  joinDate?: string;
}

const NAME_PATTERN = /^[A-Za-z\s'-]+$/;
const JOIN_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const IconCalendar = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </svg>
);

const EmployeeForm = ({ employee, departments }: Props) => {
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
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));

    setFormError('');
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = 'First name is required';
    } else if (!NAME_PATTERN.test(form.firstName.trim())) {
      nextErrors.firstName = 'firstName must contain only letters';
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = 'Last name is required';
    } else if (!NAME_PATTERN.test(form.lastName.trim())) {
      nextErrors.lastName = 'lastName must contain only letters';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (form.phone.trim()) {
      const digitsOnly = form.phone.replace(/\D/g, '');

      if (!/^[0-9+\-\s()]+$/.test(form.phone)) {
        nextErrors.phone = 'Phone number must contain only digits';
      } else if (digitsOnly.length < 7) {
        nextErrors.phone = 'Phone number is too short';
      } else if (digitsOnly.length > 15) {
        nextErrors.phone = 'Phone number is too long';
      }
    }

    if (!form.role.trim()) {
      nextErrors.role = 'Role is required';
    }

    if (!form.departmentId) {
      nextErrors.departmentId = 'Department is required';
    }

    if (!form.joinDate.trim()) {
      nextErrors.joinDate = 'Join date is required';
    } else if (!JOIN_DATE_PATTERN.test(form.joinDate.trim())) {
      nextErrors.joinDate = 'joinDate must be in YYYY-MM-DD format';
    } else if (form.joinDate.trim() > todayIso()) {
      nextErrors.joinDate = 'Join date cannot be a future date';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setFormError('');

    if (!validate()) return;

    setSaving(true);

    const record: Employee = {
      id: employee?.id ?? generateId(),
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role.trim(),
    };

    try {
      await saveEmployee(record, accessToken);
      router.push('/employees');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const deptOptions = departments.map((department) => ({
    value: department.id,
    label: department.name,
  }));

  const formBg = 'var(--bg-surface, #10151c)';
  const sectionBg = 'var(--bg-surface-soft, #151b23)';

  const sectionStyle = {
    background: sectionBg,
    borderColor: 'var(--border)',
    boxShadow: 'var(--card-shadow)',
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full space-y-5 rounded-[var(--radius-xl)] border p-4 sm:p-5"
      style={{
        background: formBg,
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <style jsx global>{`
        input,
        select,
        textarea {
          color-scheme: dark;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px var(--input-bg) inset !important;
          box-shadow: 0 0 0 1000px var(--input-bg) inset !important;
          -webkit-text-fill-color: var(--text-primary) !important;
          caret-color: var(--text-primary) !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }

        input::placeholder,
        textarea::placeholder {
          color: var(--text-muted) !important;
          opacity: 0.8;
        }
      `}</style>

      {formError && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm font-semibold"
          role="alert"
          style={{
            background: 'var(--danger-soft)',
            borderColor: 'rgba(255, 77, 79, 0.28)',
            color: 'var(--danger)',
          }}
        >
          {formError}
        </div>
      )}

      <section className="rounded-[var(--radius-lg)] border p-5" style={sectionStyle}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black"
              style={{
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
              }}
            >
              👤
            </span>

            <div>
              <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                Personal Information
              </h3>

              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Basic employee identity and contact details.
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
            Required
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input
            id="firstName"
            label="First Name"
            value={form.firstName}
            onChange={(event) => updateForm('firstName', event.target.value)}
            error={errors.firstName}
            placeholder="Muhammad"
          />

          <Input
            id="lastName"
            label="Last Name"
            value={form.lastName}
            onChange={(event) => updateForm('lastName', event.target.value)}
            error={errors.lastName}
            placeholder="Ali"
          />

          <Input
            id="email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(event) => updateForm('email', event.target.value)}
            error={errors.email}
            placeholder="ali@company.com"
          />

          <Input
            id="phone"
            label="Phone Number"
            value={form.phone}
            onChange={(event) => updateForm('phone', event.target.value)}
            error={errors.phone}
            placeholder="555-0101"
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border p-5" style={sectionStyle}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black"
              style={{
                background: 'var(--info-soft)',
                color: 'var(--info)',
              }}
            >
              💼
            </span>

            <div>
              <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                Work Information
              </h3>

              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Role, department, status, and joining date.
              </p>
            </div>
          </div>

          <span
            className="hidden rounded-full border px-3 py-1 text-xs font-bold sm:inline-flex"
            style={{
              background: 'var(--info-soft)',
              borderColor: 'rgba(61, 162, 255, 0.28)',
              color: 'var(--info)',
            }}
          >
            Organization
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input
            id="role"
            label="Role / Job Title"
            value={form.role}
            onChange={(event) => updateForm('role', event.target.value)}
            error={errors.role}
            placeholder="Junior Engineer"
          />

          <Input
            id="joinDate"
            label="Join Date"
            type="date"
            value={form.joinDate}
            onChange={(event) => updateForm('joinDate', event.target.value)}
            error={errors.joinDate}
            placeholder="Select join date"
            max={todayIso()}
            icon={<IconCalendar />}
          />

          <Select
            id="departmentId"
            label="Department"
            value={form.departmentId}
            onChange={(event) => updateForm('departmentId', event.target.value)}
            error={errors.departmentId}
            options={deptOptions}
            placeholder="Select department"
          />

          <Select
            id="status"
            label="Status"
            value={form.status}
            onChange={(event) => updateForm('status', event.target.value as EmployeeStatus)}
            options={STATUS_OPTIONS}
          />
        </div>
      </section>

      <section
        className="rounded-[var(--radius-lg)] border p-5"
        style={{
          background: 'linear-gradient(135deg, var(--accent-soft), var(--bg-surface-soft, #151b23))',
          borderColor: 'var(--border-accent)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-black"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
                color: '#111111',
                boxShadow: '0 16px 35px rgba(255, 193, 7, 0.24)',
              }}
            >
              {(form.firstName?.[0] || 'E').toUpperCase()}
              {(form.lastName?.[0] || '').toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-black" style={{ color: 'var(--text-primary)' }}>
                {form.firstName || form.lastName
                  ? `${form.firstName} ${form.lastName}`.trim()
                  : 'Employee Name'}
              </h3>

              <p className="truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
                {form.role || 'Role / Job Title'}
              </p>

              <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                {form.email || 'employee@company.com'}
              </p>
            </div>
          </div>

          <span
            className="rounded-full border px-3 py-1 text-xs font-black capitalize"
            style={{
              background:
                form.status === 'active'
                  ? 'var(--success-soft)'
                  : form.status === 'absent'
                    ? 'var(--danger-soft)'
                    : form.status === 'on_break'
                      ? 'var(--accent-soft)'
                      : form.status === 'on_leave'
                        ? 'var(--info-soft)'
                        : 'var(--bg-surface-soft)',
              borderColor:
                form.status === 'active'
                  ? 'rgba(51, 199, 90, 0.28)'
                  : form.status === 'absent'
                    ? 'rgba(255, 77, 79, 0.28)'
                    : form.status === 'on_break'
                      ? 'rgba(255, 193, 7, 0.34)'
                      : form.status === 'on_leave'
                        ? 'rgba(61, 162, 255, 0.28)'
                        : 'var(--border)',
              color:
                form.status === 'active'
                  ? 'var(--success)'
                  : form.status === 'absent'
                    ? 'var(--danger)'
                    : form.status === 'on_break'
                      ? 'var(--accent)'
                      : form.status === 'on_leave'
                        ? 'var(--info)'
                        : 'var(--text-muted)',
            }}
          >
            {form.status.replace('_', ' ')}
          </span>
        </div>
      </section>

      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border px-4 py-4"
        style={{
          background: 'var(--bg-surface-soft, #151b23)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          {isEdit
            ? 'Save changes to update this employee profile.'
            : 'Create a new employee profile in your organization.'}
        </p>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Employee'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EmployeeForm;