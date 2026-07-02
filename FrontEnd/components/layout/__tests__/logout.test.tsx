import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Sidebar from '../Sidebar';
import { makeFakeToken, superAdminUser } from '../../../__tests__/helpers/token';

const mockReplace = jest.fn();
let mockPathname = '/dashboard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => mockPathname,
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

const renderSidebar = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <Sidebar />
      </AuthProvider>
    </ThemeProvider>,
  );

describe('Logout (TC-AUTH-014 .. TC-AUTH-015)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockPathname = '/dashboard';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TC-AUTH-014
  test('logout calls the API, clears the session and redirects to /login', async () => {
    const user = userEvent.setup();

    // Session restored on mount (user is logged in).
    (global.fetch as jest.Mock) = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/api/auth/refresh')) {
        return Promise.resolve(
          jsonResponse({ accessToken: makeFakeToken(superAdminUser) }),
        );
      }
      if (url.includes('/api/auth/logout')) {
        return Promise.resolve(jsonResponse({ message: 'Logged out successfully' }));
      }
      return Promise.resolve(jsonResponse({ error: 'not found' }, false, 404));
    });

    renderSidebar();

    expect(await screen.findByText('Ada Admin')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /log out/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/logout'),
        expect.objectContaining({ method: 'POST' }),
      ),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'));

    // Session state is cleared — the user's name is no longer rendered.
    await waitFor(() => expect(screen.queryByText('Ada Admin')).not.toBeInTheDocument());
  });

  // TC-AUTH-015
  test('after logout, a fresh silent-refresh attempt (simulating back navigation) does not restore the session', async () => {
    const user = userEvent.setup();
    let refreshCallCount = 0;

    (global.fetch as jest.Mock) = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/api/auth/refresh')) {
        refreshCallCount += 1;
        // First call (initial mount) restores the session; subsequent calls
        // (post-logout) fail because the refresh cookie has been cleared.
        if (refreshCallCount === 1) {
          return Promise.resolve(jsonResponse({ accessToken: makeFakeToken(superAdminUser) }));
        }
        return Promise.resolve(jsonResponse({ error: 'No refresh token' }, false, 401));
      }
      if (url.includes('/api/auth/logout')) {
        return Promise.resolve(jsonResponse({ message: 'Logged out successfully' }));
      }
      return Promise.resolve(jsonResponse({ error: 'not found' }, false, 404));
    });

    const { unmount } = renderSidebar();
    expect(await screen.findByText('Ada Admin')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /log out/i }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'));

    // Simulate the browser back button re-mounting the app shell — AuthProvider
    // re-runs its silent refresh on mount, using the (now-cleared) cookie.
    unmount();
    mockReplace.mockClear();
    renderSidebar();

    // No admin nav / user name should appear — the app never re-enters the
    // authenticated area purely from cached UI state.
    await waitFor(() => expect(refreshCallCount).toBe(2));
    expect(screen.queryByText('Ada Admin')).not.toBeInTheDocument();
  });
});
