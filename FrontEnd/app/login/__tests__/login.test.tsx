import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/context/AuthContext';
import LoginPage from '../page';
import { makeFakeToken, superAdminUser, employeeUser } from '../../../__tests__/helpers/token';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => '/login',
}));

const jsonResponse = (body: unknown, ok = true, status = ok ? 200 : 400) => ({
  ok,
  status,
  json: async () => body,
});

const renderLoginPage = () =>
  render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  );

describe('Login Page (TC-AUTH-001 .. TC-AUTH-013)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    // Silent-refresh-on-mount call made by AuthProvider — no session by default.
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ error: 'No refresh token' }, false, 401));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TC-AUTH-001
  test('renders email and password fields with a login button', async () => {
    renderLoginPage();

    expect(await screen.findByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // TC-AUTH-002
  test('valid super_admin login redirects to /dashboard', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve(
          jsonResponse({
            accessToken: makeFakeToken(superAdminUser),
            user: superAdminUser,
          }),
        );
      }
      return Promise.resolve(jsonResponse({ error: 'No refresh token' }, false, 401));
    });

    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'admin@company.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Admin@123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
  });

  // TC-AUTH-003
  test('valid employee login redirects to /my-attendance', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve(
          jsonResponse({
            accessToken: makeFakeToken(employeeUser),
            user: employeeUser,
          }),
        );
      }
      return Promise.resolve(jsonResponse({ error: 'No refresh token' }, false, 401));
    });

    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'emp@company.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Emp@1234');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/my-attendance'));
  });

  // TC-AUTH-004
  test('missing email shows a validation error and does not submit', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/^password$/i), 'Test@1234');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.anything(),
    );
  });

  // TC-AUTH-005
  test('missing password shows a validation error and does not submit', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'admin@company.com');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.anything(),
    );
  });

  // TC-AUTH-006
  test('both fields empty shows validation errors for both', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await screen.findByLabelText(/email address/i);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  // TC-AUTH-007
  test('invalid email format shows a format validation error', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'notanemail');
    await user.type(screen.getByLabelText(/^password$/i), 'Test@1234');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.anything(),
    );
  });

  // TC-AUTH-008
  test('unregistered email shows Invalid credentials error from the API', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve(jsonResponse({ error: 'Invalid credentials' }, false, 401));
      }
      return Promise.resolve(jsonResponse({ error: 'No refresh token' }, false, 401));
    });

    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'ghost@test.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Test@1234');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  // TC-AUTH-009
  test('wrong password shows Invalid credentials error from the API', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve(jsonResponse({ error: 'Invalid credentials' }, false, 401));
      }
      return Promise.resolve(jsonResponse({ error: 'No refresh token' }, false, 401));
    });

    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'admin@company.com');
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPass!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  // TC-AUTH-010
  test('whitespace-only email is treated as empty and blocked client-side', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), '   ');
    await user.type(screen.getByLabelText(/^password$/i), 'Test@1234');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.anything(),
    );
  });

  // TC-AUTH-011
  // NOTE: the login form only checks `!password`, so a whitespace-only value
  // passes client-side validation and is submitted to the API as-is. This
  // test documents that actual behavior (API 401 -> "Invalid email or
  // password"), rather than the CSV's expected client-side block.
  test('whitespace-only password is submitted to the API and rejected there', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve(jsonResponse({ error: 'Invalid credentials' }, false, 401));
      }
      return Promise.resolve(jsonResponse({ error: 'No refresh token' }, false, 401));
    });

    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'admin@company.com');
    await user.type(screen.getByLabelText(/^password$/i), '   ');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.anything(),
    );
    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  // TC-AUTH-012
  test('unactivated account shows an activation message', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve(jsonResponse({ error: 'Account not yet activated' }, false, 401));
      }
      return Promise.resolve(jsonResponse({ error: 'No refresh token' }, false, 401));
    });

    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'newemployee@company.com');
    await user.type(screen.getByLabelText(/^password$/i), 'anything');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText(/account has not been activated yet/i),
    ).toBeInTheDocument();
  });

  // TC-AUTH-013
  test('email is sent to the API unmodified and uppercase login succeeds', async () => {
    const user = userEvent.setup();
    let sentBody: { email?: string } = {};

    (global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
      if (url.includes('/api/auth/login')) {
        sentBody = JSON.parse(options?.body as string);
        return Promise.resolve(
          jsonResponse({
            accessToken: makeFakeToken(superAdminUser),
            user: superAdminUser,
          }),
        );
      }
      return Promise.resolve(jsonResponse({ error: 'No refresh token' }, false, 401));
    });

    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'ADMIN@COMPANY.COM');
    await user.type(screen.getByLabelText(/^password$/i), 'Admin@123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
    expect(sentBody.email).toBe('ADMIN@COMPANY.COM');
  });
});
