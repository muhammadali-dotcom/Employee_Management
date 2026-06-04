// ─────────────────────────────────────────────────────────────────────────────
// lib/api.ts  —  AUTHENTICATED FETCH CLIENT
//
// A thin wrapper around fetch that:
//   1. Auto-attaches Authorization: Bearer <accessToken> header
//   2. On 401: attempts a silent token refresh once, then retries
//   3. On second 401: clears auth state (triggers redirect to /login via RouteGuard)
//
// Usage:
//   import { createApiClient } from '@/lib/api';
//   const api = createApiClient(getToken, refreshFn, logoutFn);
//   const data = await api('/api/employees');
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type ApiClientOptions = RequestInit & {
  /** Skip auth header (for public endpoints like login). */
  skipAuth?: boolean;
};

/**
 * Creates an API client bound to the current auth state.
 * Call this inside a component/hook that has access to AuthContext.
 */
export const createApiClient = (
  getToken:    () => string | null,
  refreshToken: () => Promise<string | null>,
  onAuthFailure: () => void,
) => {
  const request = async <T = unknown>(
    path: string,
    options: ApiClientOptions = {},
  ): Promise<T> => {
    const { skipAuth, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    const token = getToken();
    if (!skipAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

    let res = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',   // needed so the refresh cookie is sent
      headers,
    });

    // Silent token refresh on 401
    if (res.status === 401 && !skipAuth) {
      const newToken = await refreshToken();

      if (newToken) {
        // Retry the original request with the fresh token
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(url, {
          ...fetchOptions,
          credentials: 'include',
          headers,
        });
      }

      // If still 401 after refresh, session is truly dead
      if (res.status === 401) {
        onAuthFailure();
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed with status ${res.status}`);
    }

    // Handle empty responses (e.g. 204 No Content)
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  }

  return request;
}

/**
 * Hook-friendly shorthand: returns an api function pre-bound to AuthContext.
 * Import and call this inside components.
 */
export { API_BASE };
