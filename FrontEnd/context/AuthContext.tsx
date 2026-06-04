'use client';

// ─────────────────────────────────────────────────────────────────────────────
// context/AuthContext.tsx  —  AUTHENTICATION STATE
//
// Holds the access token and authenticated user info IN MEMORY ONLY.
// The token is never written to localStorage or sessionStorage.
//
// The refresh token lives in an HttpOnly cookie managed by the browser —
// JavaScript cannot read it. When the access token expires (or on page reload),
// we call POST /api/auth/refresh to silently get a new access token.
// The new token's payload is decoded (client-side, no signature verification
// needed here — the server already verified it) to restore the user object.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type UserRole = 'super_admin' | 'employee';

export interface AuthUser {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
  role:      UserRole;
}

interface AuthContextValue {
  user:               AuthUser | null;
  accessToken:        string | null;
  /** true while the initial silent refresh is in progress (used by RouteGuard) */
  isInitializing:     boolean;
  login:              (email: string, password: string) => Promise<void>;
  logout:             () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  setToken:           (token: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** Decode the payload of a JWT without verifying the signature. */
function decodeJwt(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id:        payload.id,
      firstName: payload.firstName,
      lastName:  payload.lastName,
      email:     payload.email,
      role:      payload.role,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                   = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken]     = useState<string | null>(null);
  const [isInitializing, setInitializing] = useState(true);

  // ── Silent refresh on mount (handles page reloads) ───────────────────────
  useEffect(() => {
    async function tryRestore() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method:      'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const decoded = decodeJwt(data.accessToken);
          if (decoded) {
            setAccessToken(data.accessToken);
            setUser(decoded);
          }
        }
      } catch {
        // No valid refresh cookie — user needs to log in
      } finally {
        setInitializing(false);
      }
    }
    tryRestore();
  }, []); // runs once on mount

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Login failed');
    }

    const data = await res.json();
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method:      'POST',
        credentials: 'include',
      });
    } catch {
      // Clear state regardless of network error
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  // ── Silent token refresh ──────────────────────────────────────────────────
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method:      'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        setAccessToken(null);
        setUser(null);
        return null;
      }

      const data = await res.json();
      const decoded = decodeJwt(data.accessToken);
      if (decoded) {
        setAccessToken(data.accessToken);
        setUser(decoded);
      }
      return data.accessToken as string;
    } catch {
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

  const setToken = useCallback((token: string) => {
    setAccessToken(token);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isInitializing, login, logout, refreshAccessToken, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
