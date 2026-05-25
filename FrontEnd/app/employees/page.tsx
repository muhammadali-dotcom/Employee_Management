import AppShell from '@/components/layout/AppShell';
import EmployeeTable from '@/components/employees/EmployeeTable';

export default function EmployeesPage() {
  return (
    <AppShell>
      <EmployeeTable />
    </AppShell>
  );
}
