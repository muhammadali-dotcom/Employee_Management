'use client';

// ─────────────────────────────────────────────────────────────────────────────
// components/auth/RouteGuard.tsx  —  CLIENT-SIDE ROUTE PROTECTION
//
// How it works:
//   1. On page load, AuthContext tries a silent refresh (handles reloads).
//      While that's happening, isInitializing=true and we show a loader.
//   2. Once initializing is done, we have a definitive user (or null).
//   3. Based on user + current path, we redirect or render children.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ADMIN_ROUTES    = ['/attendance', '/employees', '/departments', '/dashboard'];
const EMPLOYEE_ROUTES = ['/my-attendance'];
const PUBLIC_ROUTES   = ['/login'];

interface RouteGuardProps {
  children: ReactNode;
}

const RouteGuard = ({ children }: RouteGuardProps) => {
  const { user, isInitializing } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the initial silent token refresh has completed
    if (isInitializing) return;

    const isPublic   = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
    const isAdmin    = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
    const isEmployee = EMPLOYEE_ROUTES.some((r) => pathname.startsWith(r));

    if (!user) {
      // Not logged in — send to /login unless already there
      if (!isPublic) router.replace('/login');
      return;
    }

    // Already logged in, on the login page — redirect to home
    if (isPublic) {
      router.replace(user.role === 'super_admin' ? '/dashboard' : '/my-attendance');
      return;
    }

    // Employee trying to access admin-only route
    if (user.role === 'employee' && isAdmin) {
      router.replace('/my-attendance');
      return;
    }

    // Super admin trying to access employee-only route
    if (user.role === 'super_admin' && isEmployee) {
      router.replace('/dashboard');
      return;
    }
  }, [user, isInitializing, pathname, router]);

  // Show a blank loader while we wait for the auth check to finish
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in and not on a public page — render nothing (redirect is in-flight)
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  if (!user && !isPublic) return null;

  return <>{children}</>;
};

export default RouteGuard;
