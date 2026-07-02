import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import NewEmployeePage from '../page';
import { makeFakeToken, superAdminUser, employeeUser } from '../../../../__tests__/helpers/token';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush, back: mockBack }),
  usePathname: () => '/employees/new',
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

const departments = [
  { id: 'dept-eng', name: 'Engineering', description: '', createdAt: '' },
  { id: 'dept-hr', name: 'HR', description: '', createdAt: '' },
];

let currentUser = superAdminUser;
let departmentsResponse: () => ReturnType<typeof jsonResponse> = () => jsonResponse(departments);
let createEmployeeResponse: () => ReturnType<typeof jsonResponse> = () => jsonResponse({ id: 'new-id' }, true, 201);
const postCalls: Record<string, unknown>[] = [];

const installFetchMock = () => {
  postCalls.length = 0;

  global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
    const method = options?.method ?? 'GET';

    if (url.includes('/api/auth/refresh')) {
      return Promise.resolve(jsonResponse({ accessToken: makeFakeToken(currentUser) }));
    }
    if (url.includes('/api/departments')) {
      return Promise.resolve(departmentsResponse());
    }
    if (/\/api\/employees\/[^/]+$/.test(url) && method === 'GET') {
      // saveEmployee() probes for an existing record first; not found -> POST (create) path.
      return Promise.resolve(jsonResponse({ error: 'not found' }, false, 404));
    }
    if (url.endsWith('/api/employees') && method === 'POST') {
      postCalls.push(JSON.parse((options?.body as string) ?? '{}'));
      return Promise.resolve(createEmployeeResponse());
    }
    return Promise.resolve(jsonResponse({ error: 'not found' }, false, 404));
  }) as jest.Mock;
};

const renderNewEmployeePage = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <NewEmployeePage />
      </AuthProvider>
    </ThemeProvider>,
  );

interface FieldOverrides {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  joinDate?: string;
  department?: string;
}

const VALID: Required<FieldOverrides> = {
  firstName: 'Muhammad',
  lastName: 'Ali',
  email: 'm.ali@company.com',
  phone: '',
  role: 'Developer',
  joinDate: '2024-01-15',
  department: 'Engineering',
};

/** Fills the Add Employee form. Pass `null` for a field to leave it blank. */
const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<Record<keyof FieldOverrides, string | null>> = {},
) => {
  const values = { ...VALID, ...overrides };

  // Wait for AppShell's RouteGuard to finish its silent-refresh check and
  // for EmployeeForm to actually be mounted before interacting with it.
  await screen.findByLabelText(/first name/i);

  if (values.firstName) await user.type(screen.getByLabelText(/first name/i), values.firstName);
  if (values.lastName) await user.type(screen.getByLabelText(/last name/i), values.lastName);
  if (values.email) await user.type(screen.getByLabelText(/email address/i), values.email);
  if (values.phone) await user.type(screen.getByLabelText(/phone number/i), values.phone);
  if (values.role) await user.type(screen.getByLabelText(/role \/ job title/i), values.role);

  if (values.joinDate !== null) {
    fireEvent.change(screen.getByLabelText(/join date/i), { target: { value: values.joinDate } });
  } else {
    fireEvent.change(screen.getByLabelText(/join date/i), { target: { value: '' } });
  }

  if (values.department) {
    await user.selectOptions(screen.getByLabelText(/department/i), values.department);
  }
};

const submit = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /add employee/i }));
};

describe('Add Employee form (TC-AE-049 .. TC-AE-080)', () => {
  beforeEach(() => {
    currentUser = superAdminUser;
    departmentsResponse = () => jsonResponse(departments);
    createEmployeeResponse = () => jsonResponse({ id: 'new-id' }, true, 201);
    mockReplace.mockClear();
    mockPush.mockClear();
    mockBack.mockClear();
    installFetchMock();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TC-AE-049
  test('Add Employee page redirects employees away from super_admin-only route', async () => {
    currentUser = employeeUser;
    renderNewEmployeePage();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/my-attendance'));
  });

  // TC-AE-050
  test('creates an employee with all valid required fields', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, {});
    await submit(user);

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(postCalls[0]).toMatchObject({
      firstName: 'Muhammad',
      lastName: 'Ali',
      email: 'm.ali@company.com',
      role: 'Developer',
      departmentId: 'dept-eng',
    });
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/employees'));
  });

  // TC-AE-051
  test('missing first name shows a validation error and blocks submit', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { firstName: null });
    await submit(user);

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-052
  test('missing last name shows a validation error and blocks submit', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { lastName: null });
    await submit(user);

    expect(await screen.findByText(/last name is required/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-053
  test('missing email shows a validation error and blocks submit', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { email: null });
    await submit(user);

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-054 — the <form> has no `noValidate`, so the browser's native
  // type="email" constraint validation blocks the submit event before our
  // handleSubmit (and its "Enter a valid email address" message) ever runs.
  // The testable, mechanism-agnostic assertion is simply: no API call happens.
  test('email without an @ symbol shows a format error', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { email: 'ali.company.com' });
    await submit(user);

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-055 — same native-validation caveat as TC-AE-054.
  test('email with @ but no domain shows a format error', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { email: 'ali@' });
    await submit(user);

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-056 — KNOWN GAP: saveEmployee() (lib/store.ts) never checks response.ok,
  // so a 400 "duplicate email" response from the API is silently swallowed and the
  // form still navigates away as if it succeeded.
  test('duplicate email is rejected with an error and no navigation', async () => {
    const user = userEvent.setup();
    createEmployeeResponse = () =>
      jsonResponse({ error: 'An employee with this email already exists' }, false, 400);
    renderNewEmployeePage();

    await fillForm(user, { email: 'existing@company.com' });
    await submit(user);

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(
      await screen.findByText(/employee with this email already exists/i),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalledWith('/employees');
  });

  // TC-AE-057
  test('email with uppercase letters is accepted', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { email: 'ALI@COMPANY.COM' });
    await submit(user);

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(postCalls[0]).toMatchObject({ email: 'ALI@COMPANY.COM' });
  });

  // TC-AE-058 — KNOWN GAP: no phone validation exists (validate() never checks `phone`).
  test('phone field with alphabetic characters is rejected', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { phone: 'abc-phone' });
    await submit(user);

    expect(await screen.findByText(/phone/i, { selector: '[role="alert"]' })).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-059 — KNOWN GAP: no minimum length check on phone.
  test('phone field that is too short is rejected', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { phone: '123' });
    await submit(user);

    expect(await screen.findByText(/phone/i, { selector: '[role="alert"]' })).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-060 — KNOWN GAP: no maximum length check on phone.
  test('phone field that is too long is rejected', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { phone: '12345678901234567890' });
    await submit(user);

    expect(await screen.findByText(/phone/i, { selector: '[role="alert"]' })).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-061 — KNOWN GAP: validate() only checks that firstName is non-empty, no
  // letters-only regex, so "2223" currently passes and the employee gets created.
  test('first name with numbers only is rejected', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { firstName: '2223' });
    await submit(user);

    expect(await screen.findByText(/firstname must contain only letters/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-062 — KNOWN GAP: same as TC-AE-061 for lastName.
  test('last name with numbers only is rejected', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { lastName: '9999' });
    await submit(user);

    expect(await screen.findByText(/lastname must contain only letters/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-063 — KNOWN GAP: mixed letters/numbers currently accepted.
  test('first name with mixed letters and numbers is rejected', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { firstName: 'Ali123' });
    await submit(user);

    expect(await screen.findByText(/firstname must contain only letters/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-064 — KNOWN GAP: symbols currently accepted (no regex at all).
  // test('first name with symbols is rejected', async () => {
  //   const user = userEvent.setup();
  //   renderNewEmployeePage();

  //   await fillForm(user, { firstName: 'Ali@#' });
  //   await submit(user);

  //   expect(await screen.findByText(/firstname must contain only letters/i)).toBeInTheDocument();
  //   expect(postCalls).toHaveLength(0);
  // });

    test('first name with symbols is rejected', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { firstName: 'Ali@#' });
    await submit(user);

    expect(await screen.findByText(/firstname must contain only numbers/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });
  

  // TC-AE-065
  test('whitespace-only first name is rejected as required', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { firstName: '   ' });
    await submit(user);

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-066
  test('very long first name does not crash the UI and is accepted', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    const longName = 'a'.repeat(120);
    await fillForm(user, { firstName: longName });
    await submit(user);

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(screen.getByRole('button', { name: /add employee|saving/i })).toBeInTheDocument();
  });

  // TC-AE-067
  test('missing role shows a validation error and blocks submit', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { role: null });
    await submit(user);

    expect(await screen.findByText(/role is required/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-068 — KNOWN GAP: validate() never checks joinDate at all, so clearing it
  // does not block submission.
  test('missing join date shows a validation error and blocks submit', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { joinDate: null });
    await submit(user);

    expect(await screen.findByText(/join date is required/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-069 — Join Date is a native <input type="date">, so the browser's
  // own date-picker widget structurally can't hold a DD-MM-YYYY string: any
  // attempt to set a non-ISO value sanitizes the field back to empty. That
  // correctly surfaces as the "required" error rather than a distinct format
  // error — there's no way for a malformed value to ever reach validate().
  test('join date in DD-MM-YYYY format cannot be entered and blocks submit', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { joinDate: '15-01-2024' });
    const joinDateInput = screen.getByLabelText(/join date/i) as HTMLInputElement;
    expect(joinDateInput.value).toBe('');

    await submit(user);

    expect(await screen.findByText(/join date is required/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-070 — same native date-picker sanitization as TC-AE-069.
  test('join date as a plain text string cannot be entered and blocks submit', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { joinDate: 'January 15' });
    const joinDateInput = screen.getByLabelText(/join date/i) as HTMLInputElement;
    expect(joinDateInput.value).toBe('');

    await submit(user);

    expect(await screen.findByText(/join date is required/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-071 — business rule (confirmed): joining in the future is not
  // allowed. A future join date is rejected with a validation error and
  // blocks submission, instead of the previously-undefined "accept either
  // way" behavior.
  test('future join date is rejected and blocks submit', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { joinDate: '2099-12-01' });
    await submit(user);

    expect(await screen.findByText(/join date cannot be a future date/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-072
  test('missing department shows a validation error and blocks submit', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { department: null });
    await submit(user);

    expect(await screen.findByText(/department is required/i)).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-073
  test('department dropdown loads all departments from the API', async () => {
    renderNewEmployeePage();

    const select = await screen.findByLabelText(/department/i);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Engineering' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'HR' })).toBeInTheDocument();
    });
    expect(select).toBeInTheDocument();
  });

  // TC-AE-074 — KNOWN GAP: getDepartments() swallows API failures and resolves to
  // [], so the page never surfaces a visible error message.
  test('department API failure shows a friendly error', async () => {
    departmentsResponse = () => jsonResponse({ error: 'Internal error' }, false, 500);
    renderNewEmployeePage();

    expect(
      await screen.findByText(/could not load departments|failed to load departments/i),
    ).toBeInTheDocument();
  });

  // TC-AE-075
  test('status dropdown defaults to Active', async () => {
    renderNewEmployeePage();

    const statusSelect = (await screen.findByLabelText(/^status$/i)) as HTMLSelectElement;
    expect(statusSelect.value).toBe('active');
    expect(screen.getAllByText(/^active$/i).length).toBeGreaterThan(0);
  });

  // TC-AE-076
  test('cancel without entering data returns to the previous page with no API call', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await screen.findByLabelText(/first name/i);
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockBack).toHaveBeenCalled();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-077
  test('cancel after partial data entry discards the data with no API call', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await user.type(await screen.findByLabelText(/first name/i), 'Test');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockBack).toHaveBeenCalled();
    expect(postCalls).toHaveLength(0);
  });

  // TC-AE-078
  test('double-clicking Add Employee only creates one employee record', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, {});
    const button = screen.getByRole('button', { name: /add employee/i });
    await user.dblClick(button);

    await waitFor(() => expect(postCalls.length).toBeGreaterThan(0));
    expect(postCalls).toHaveLength(1);
  });

  // TC-AE-079
  test('submit button shows a loading state while the API call is in flight', async () => {
    const user = userEvent.setup();
    let resolvePost!: (value: ReturnType<typeof jsonResponse>) => void;
    createEmployeeResponse = () => {
      throw new Error('use pending promise instead');
    };
    // Override with a manually-controlled pending promise for this test only.
    global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
      const method = options?.method ?? 'GET';
      if (url.includes('/api/auth/refresh')) {
        return Promise.resolve(jsonResponse({ accessToken: makeFakeToken(currentUser) }));
      }
      if (url.includes('/api/departments')) {
        return Promise.resolve(jsonResponse(departments));
      }
      if (/\/api\/employees\/[^/]+$/.test(url) && method === 'GET') {
        return Promise.resolve(jsonResponse({ error: 'not found' }, false, 404));
      }
      if (url.endsWith('/api/employees') && method === 'POST') {
        return new Promise((resolve) => {
          resolvePost = resolve;
        });
      }
      return Promise.resolve(jsonResponse({ error: 'not found' }, false, 404));
    }) as jest.Mock;

    renderNewEmployeePage();
    await fillForm(user, {});
    await submit(user);

    expect(await screen.findByRole('button', { name: /saving/i })).toBeDisabled();

    resolvePost(jsonResponse({ id: 'new-id' }, true, 201));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/employees'));
  });

  // TC-AE-080
  test('newly created employee is sent to the API and the user is returned to the list', async () => {
    const user = userEvent.setup();
    renderNewEmployeePage();

    await fillForm(user, { firstName: 'Sara', lastName: 'Khan', email: 'sara.khan@company.com' });
    await submit(user);

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(postCalls[0]).toMatchObject({
      firstName: 'Sara',
      lastName: 'Khan',
      email: 'sara.khan@company.com',
    });
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/employees'));
  });
});
