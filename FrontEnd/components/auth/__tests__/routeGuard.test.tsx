import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import RouteGuard from '../RouteGuard';
import { makeFakeToken, superAdminUser, employeeUser } from '../../../__tests__/helpers/token';

const mockReplace = jest.fn();
let mockPathname = '/dashboard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => mockPathname,
}));

const jsonResponse = (body: unknown, ok = true, status = ok ? 200 : 400) => ({
  ok,
  status,
  json: async () => body,
});

const renderGuarded = () =>
  render(
    <AuthProvider>
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    </AuthProvider>,
  );

describe('RouteGuard / Session (TC-AUTH-016, 019, 020, 021)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TC-AUTH-016
  test('page reload silently restores the session via /api/auth/refresh, no forced logout', async () => {
    mockPathname = '/dashboard';
    global.fetch = jest.fn().mockImplementation((url: string) =>
      url.includes('/api/auth/refresh')
        ? Promise.resolve(jsonResponse({ accessToken: makeFakeToken(superAdminUser) }))
        : Promise.resolve(jsonResponse({ error: 'not found' }, false, 404)),
    );

    renderGuarded();

    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith('/login');
  });

  // TC-AUTH-019
  test.each([
    { label: 'super_admin', user: superAdminUser, expectedRoute: '/dashboard' },
    { label: 'employee', user: employeeUser, expectedRoute: '/my-attendance' },
  ])('authenticated $label visiting /login is redirected to $expectedRoute', async ({ user, expectedRoute }) => {
    mockPathname = '/login';
    global.fetch = jest.fn().mockImplementation((url: string) =>
      url.includes('/api/auth/refresh')
        ? Promise.resolve(jsonResponse({ accessToken: makeFakeToken(user) }))
        : Promise.resolve(jsonResponse({ error: 'not found' }, false, 404)),
    );

    renderGuarded();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(expectedRoute));
  });

  // TC-AUTH-020
  test('employee visiting /dashboard is redirected to /my-attendance', async () => {
    mockPathname = '/dashboard';
    global.fetch = jest.fn().mockImplementation((url: string) =>
      url.includes('/api/auth/refresh')
        ? Promise.resolve(jsonResponse({ accessToken: makeFakeToken(employeeUser) }))
        : Promise.resolve(jsonResponse({ error: 'not found' }, false, 404)),
    );

    renderGuarded();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/my-attendance'));
  });

  // TC-AUTH-021
  test('super_admin visiting /my-attendance is redirected to /dashboard', async () => {
    mockPathname = '/my-attendance';
    global.fetch = jest.fn().mockImplementation((url: string) =>
      url.includes('/api/auth/refresh')
        ? Promise.resolve(jsonResponse({ accessToken: makeFakeToken(superAdminUser) }))
        : Promise.resolve(jsonResponse({ error: 'not found' }, false, 404)),
    );

    renderGuarded();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
  });
});
