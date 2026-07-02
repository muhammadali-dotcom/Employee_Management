import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import DashboardPage from '../page';
import { makeFakeToken, superAdminUser, employeeUser } from '../../../__tests__/helpers/token';
import type { Employee, Department } from '@/lib/types';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => '/dashboard',
}));

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const jsonResponse = (body: unknown, ok = true, status = ok ? 200 : 400) => ({
  ok,
  status,
  json: async () => body,
});

const makeEmployee = (overrides: Partial<Employee>): Employee => ({
  id: overrides.id ?? 'emp',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@company.com',
  phone: '',
  role: 'Developer',
  departmentId: 'dept-eng',
  status: 'active',
  joinDate: '2024-01-01',
  ...overrides,
});

const departments: Department[] = [
  { id: 'dept-eng', name: 'Engineering', description: '', createdAt: '2024-01-01' },
  { id: 'dept-hr', name: 'HR', description: '', createdAt: '2024-01-01' },
];

const employees: Employee[] = [
  makeEmployee({ id: '1', firstName: 'Ann', lastName: 'A', status: 'active', departmentId: 'dept-eng' }),
  makeEmployee({ id: '2', firstName: 'Bob', lastName: 'B', status: 'active', departmentId: 'dept-eng' }),
  makeEmployee({ id: '3', firstName: 'Cara', lastName: 'C', status: 'inactive', departmentId: 'dept-eng' }),
  makeEmployee({ id: '4', firstName: 'Dee', lastName: 'D', status: 'on_leave', departmentId: 'dept-hr' }),
  makeEmployee({ id: '5', firstName: 'Eli', lastName: 'E', status: 'on_break', departmentId: 'dept-hr' }),
  makeEmployee({ id: '6', firstName: 'Fay', lastName: 'F', status: 'absent', departmentId: 'dept-hr' }),
];

let currentUser = superAdminUser;
let employeesResponse: () => ReturnType<typeof jsonResponse> = () => jsonResponse(employees);
let departmentsResponse: () => ReturnType<typeof jsonResponse> = () => jsonResponse(departments);

const installFetchMock = () => {
  global.fetch = jest.fn().mockImplementation((url: string) => {
    if (url.includes('/api/auth/refresh')) {
      return Promise.resolve(jsonResponse({ accessToken: makeFakeToken(currentUser) }));
    }
    if (url.includes('/api/employees')) return Promise.resolve(employeesResponse());
    if (url.includes('/api/departments')) return Promise.resolve(departmentsResponse());
    return Promise.resolve(jsonResponse({ error: 'not found' }, false, 404));
  }) as jest.Mock;
};

const renderDashboard = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </ThemeProvider>,
  );

describe('Dashboard (TC-DASH-001 .. TC-DASH-015)', () => {
  beforeEach(() => {
    currentUser = superAdminUser;
    employeesResponse = () => jsonResponse(employees);
    departmentsResponse = () => jsonResponse(departments);
    mockReplace.mockClear();
    installFetchMock();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TC-DASH-001
  test('dashboard loads without errors for super_admin: stats cards and department summary visible', async () => {
    renderDashboard();

    expect(await screen.findByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Department Breakdown')).toBeInTheDocument();
  });

  // TC-DASH-002 — NOTE: the first StatsCard's key is `total` but its label is
  // "Present" (see STAT_CONFIG in dashboard/page.tsx), not "Total Employees".
  // The exact count is still surfaced correctly elsewhere: the donut-chart
  // center in the Department Breakdown panel is captioned "Total Employees"
  // and shows employees.length, so we assert against that instead.
  test('a "Total Employees" indicator shows the exact employee count', async () => {
    renderDashboard();

    await screen.findByText('Active');
    const caption = await screen.findByText('Total Employees');
    await waitFor(() => expect(caption.parentElement).toHaveTextContent(String(employees.length)));
  });

  // TC-DASH-003
  test('the Active count card matches the number of active employees', async () => {
    renderDashboard();

    await screen.findByText('Active');
    await waitFor(() => {
      const card = screen.getByText('Active').closest('button');
      expect(card).toHaveTextContent('2');
    });
  });

  // TC-DASH-004
  test('status breakdown cards match active/inactive/on_leave/on_break/absent counts', async () => {
    renderDashboard();

    await screen.findByText('Active');
    const expectations: Record<string, string> = {
      Active: '2',
      'On Break': '1',
      'On Leave': '1',
      Absent: '1',
      Inactive: '1',
    };

    await waitFor(() => {
      Object.entries(expectations).forEach(([label, value]) => {
        const card = screen.getAllByText(label).map((el) => el.closest('button')).find(Boolean);
        expect(card).toHaveTextContent(value);
      });
    });
  });

  // TC-DASH-005
  test('department summary shows correct names and per-department employee counts', async () => {
    renderDashboard();

    await screen.findByText('Department Breakdown');
    expect(await screen.findByText('Engineering')).toBeInTheDocument();
    expect(await screen.findByText('HR')).toBeInTheDocument();
    // Both departments have 3 of 6 employees = 50% each, so "3 (50%)" appears twice.
    await waitFor(() => expect(screen.getAllByText('3 (50%)')).toHaveLength(2));
  });

  // TC-DASH-006
  test('monthly attendance summary section is visible', async () => {
    renderDashboard();

    expect(await screen.findByText('Monthly Attendance')).toBeInTheDocument();
  });

  // TC-DASH-007
  test('recent activity lists employees with a relative timestamp', async () => {
    employeesResponse = () =>
      jsonResponse([
        makeEmployee({ id: '1', firstName: 'Recent', lastName: 'Hire', lastLoginAt: new Date().toISOString() }),
      ]);
    renderDashboard();

    expect(await screen.findByText('Recent Hire')).toBeInTheDocument();
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  // TC-DASH-008
  test('dashboard reflects an increased employee count after a new employee is created', async () => {
    const { unmount } = renderDashboard();
    await screen.findByText('Active');
    await waitFor(() => expect(screen.getByText('Active').closest('button')).toHaveTextContent('2'));

    // Simulate returning to the dashboard after creating a new active employee.
    unmount();
    employeesResponse = () =>
      jsonResponse([...employees, makeEmployee({ id: '7', firstName: 'New', lastName: 'Hire', status: 'active' })]);
    renderDashboard();

    await screen.findByText('Active');
    await waitFor(() => expect(screen.getByText('Active').closest('button')).toHaveTextContent('3'));
  });

  // TC-DASH-009
  test('dashboard reflects a decreased employee count after an employee is deleted', async () => {
    const { unmount } = renderDashboard();
    await screen.findByText('Active');
    await waitFor(() => expect(screen.getByText('Active').closest('button')).toHaveTextContent('2'));

    // Simulate returning to the dashboard after deleting one active employee.
    unmount();
    employeesResponse = () => jsonResponse(employees.filter((e) => e.id !== '1'));
    renderDashboard();

    await screen.findByText('Active');
    await waitFor(() => expect(screen.getByText('Active').closest('button')).toHaveTextContent('1'));
  });

  // TC-DASH-010
  test('dashboard shows a zero-count empty state with no crash when there are no employees', async () => {
    employeesResponse = () => jsonResponse([]);
    renderDashboard();

    await screen.findByText('Active');
    const card = screen.getByText('Active').closest('button');
    expect(card).toHaveTextContent('0');
    expect(await screen.findByText('No recent activity found')).toBeInTheDocument();
  });

  // TC-DASH-011
  test('department summary shows a zero state with no crash when there are no departments', async () => {
    departmentsResponse = () => jsonResponse([]);
    renderDashboard();

    expect(await screen.findByText('Department Breakdown')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText('0').length).toBeGreaterThan(0));
  });

  // TC-DASH-012
  test('dashboard does not crash and shows an empty state when the API fails', async () => {
    employeesResponse = () => jsonResponse({ error: 'Internal error' }, false, 500);
    departmentsResponse = () => jsonResponse({ error: 'Internal error' }, false, 500);
    renderDashboard();

    await screen.findByText('Active');
    const card = screen.getByText('Active').closest('button');
    expect(card).toHaveTextContent('0');
  });

  // TC-DASH-013 / TC-DASH-014 — shallow smoke check: toggling theme doesn't
  // crash the page and content stays in the document. Not a real contrast check.
  test.each(['dark', 'light'])('dashboard renders without crashing in %s mode', async (mode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    renderDashboard();

    expect(await screen.findByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Department Breakdown')).toBeInTheDocument();
    document.documentElement.classList.remove('dark');
  });

  // TC-DASH-015
  test('dashboard is inaccessible to the employee role (redirected to /my-attendance)', async () => {
    currentUser = employeeUser;
    renderDashboard();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/my-attendance'));
  });
});
