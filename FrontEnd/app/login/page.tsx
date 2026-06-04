'use client';

// ─────────────────────────────────────────────────────────────────────────────
// app/login/page.tsx  —  LOGIN PAGE
//
// Standalone page — no AppShell, no sidebar, no header.
// Uses AuthContext.login() to authenticate and redirects to the
// user's role-appropriate home page on success.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Inline validation errors
  const [emailErr,    setEmailErr]    = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      router.replace(user.role === 'super_admin' ? '/attendance' : '/my-attendance');
    }
  }, [user, router]);

  function validate(): boolean {
    let valid = true;
    setEmailErr('');
    setPasswordErr('');

    if (!email.trim()) {
      setEmailErr('Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordErr('Password is required');
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      // Redirect is handled by the useEffect above once user state is set
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      // Normalise API error messages for the user
      if (msg.includes('Invalid credentials') || msg.includes('401')) {
        setError('Invalid email or password');
      } else if (msg.includes('not yet activated')) {
        setError('Your account has not been activated yet. Contact your admin.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white text-xl font-bold mb-4"
              style={{ backgroundColor: '#0a66c2' }}
            >
              E
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to Employee Management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
                placeholder="you@company.com"
                aria-invalid={!!emailErr}
                aria-describedby={emailErr ? 'email-error' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition focus:ring-2 ${
                  emailErr
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {emailErr && (
                <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">
                  {emailErr}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordErr(''); }}
                placeholder="••••••••"
                aria-invalid={!!passwordErr}
                aria-describedby={passwordErr ? 'password-error' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition focus:ring-2 ${
                  passwordErr
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {passwordErr && (
                <p id="password-error" className="mt-1 text-xs text-red-600" role="alert">
                  {passwordErr}
                </p>
              )}
            </div>

            {/* API error */}
            {error && (
              <div
                className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: loading ? '#4a90d9' : '#0a66c2' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
