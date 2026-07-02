'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const { login, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailErr, setEmailErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  useEffect(() => {
    if (user) {
      router.replace(user.role === 'super_admin' ? '/dashboard' : '/my-attendance');
    }
  }, [user, router]);

  const validate = (): boolean => {
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
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';

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
  };

  const inputStyle = {
    color: 'var(--text-primary)',
    WebkitTextFillColor: 'var(--text-primary)',
    caretColor: 'var(--text-primary)',
    WebkitBoxShadow: '0 0 0 1000px var(--input-bg) inset',
    boxShadow: '0 0 0 1000px var(--input-bg) inset',
    transition: 'background-color 9999s ease-in-out 0s',
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{
        background:
          'radial-gradient(circle at 76% 2%, rgba(255, 193, 7, 0.24), transparent 28%), radial-gradient(circle at 15% 88%, rgba(255, 193, 7, 0.14), transparent 24%), linear-gradient(135deg, var(--bg-base), var(--bg-base-soft))',
        color: 'var(--text-primary)',
      }}
    >
      <style jsx global>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px var(--input-bg) inset !important;
          box-shadow: 0 0 0 1000px var(--input-bg) inset !important;
          -webkit-text-fill-color: var(--text-primary) !important;
          caret-color: var(--text-primary) !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }

        input::placeholder {
          color: var(--text-muted);
          opacity: 0.8;
        }
      `}</style>

      {/* Background decorative layer */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'var(--accent-soft)' }}
      />

      <div
        className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'rgba(255, 193, 7, 0.12)' }}
      />

      <div
        className="relative z-10 grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[var(--radius-xl)] border lg:grid-cols-[1.05fr_0.95fr]"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--card-shadow-hover)',
          backdropFilter: 'var(--blur)',
          WebkitBackdropFilter: 'var(--blur)',
        }}
      >
        {/* Left brand panel */}
        <section
          className="relative hidden overflow-hidden p-8 lg:flex lg:flex-col lg:justify-between"
          style={{
            background: 'linear-gradient(135deg, var(--accent-soft), var(--bg-surface-soft))',
            borderRight: '1px solid var(--border)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-14 top-16 h-48 w-48 rounded-full blur-3xl"
            style={{ background: 'var(--accent-soft)' }}
          />

          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3">
              <div
                className="flex h-13 w-13 items-center justify-center rounded-2xl text-xl font-black"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
                  color: '#111111',
                  boxShadow: '0 16px 35px rgba(255, 193, 7, 0.30)',
                }}
              >
                E
              </div>

              <div>
                <h1
                  className="text-xl font-black leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  EMS
                </h1>

                <p
                  className="text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Employee Management System
                </p>
              </div>
            </div>

            <h2
              className="max-w-md text-4xl font-black leading-tight tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              My name is ALI, and I am here to help you manage your employees efficiently.
            </h2>

            <p
              className="mt-4 max-w-md text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Track employees, attendance, departments, and daily activity from one clean dashboard.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            {[
              { label: 'Employees', value: '120+' },
              { label: 'Departments', value: '12' },
              { label: 'Attendance', value: 'Live' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border p-3"
                style={{
                  background: 'var(--bg-surface-soft)',
                  borderColor: 'var(--border)',
                }}
              >
                <p
                  className="text-lg font-black"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.value}
                </p>

                <p
                  className="text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Login form */}
        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto flex min-h-[560px] max-w-md flex-col justify-center">
            <div className="mb-8 text-center lg:text-left">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black lg:mx-0"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
                  color: '#111111',
                  boxShadow: '0 16px 35px rgba(255, 193, 7, 0.28)',
                }}
              >
                E
              </div>

              <h1
                className="text-3xl font-black tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Welcome back
              </h1>

              <p
                className="mt-2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Sign in to continue to Employee Management.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-bold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Email address
                </label>

                <div
                  className="flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: emailErr ? 'rgba(255, 77, 79, 0.45)' : 'var(--input-border)',
                    boxShadow: emailErr ? '0 0 0 4px var(--danger-soft)' : 'none',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>✉</span>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailErr('');
                      setError('');
                    }}
                    placeholder="you@company.com"
                    aria-invalid={!!emailErr}
                    aria-describedby={emailErr ? 'email-error' : undefined}
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                {emailErr && (
                  <p
                    id="email-error"
                    className="mt-1.5 text-xs font-semibold"
                    style={{ color: 'var(--danger)' }}
                    role="alert"
                  >
                    {emailErr}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-bold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Password
                </label>

                <div
                  className="flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: passwordErr ? 'rgba(255, 77, 79, 0.45)' : 'var(--input-border)',
                    boxShadow: passwordErr ? '0 0 0 4px var(--danger-soft)' : 'none',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>🔒</span>

                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordErr('');
                      setError('');
                    }}
                    placeholder="••••••••"
                    aria-invalid={!!passwordErr}
                    aria-describedby={passwordErr ? 'password-error' : undefined}
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                {passwordErr && (
                  <p
                    id="password-error"
                    className="mt-1.5 text-xs font-semibold"
                    style={{ color: 'var(--danger)' }}
                    role="alert"
                  >
                    {passwordErr}
                  </p>
                )}
              </div>

              {/* API error */}
              {error && (
                <div
                  className="rounded-2xl border px-4 py-3 text-sm font-semibold"
                  role="alert"
                  style={{
                    background: 'var(--danger-soft)',
                    borderColor: 'rgba(255, 77, 79, 0.28)',
                    color: 'var(--danger)',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: loading
                    ? 'linear-gradient(135deg, rgba(255,193,7,0.70), rgba(255,220,99,0.70))'
                    : 'linear-gradient(135deg, var(--accent), #ffdc63)',
                  color: '#111111',
                  boxShadow: '0 16px 35px rgba(255, 193, 7, 0.24)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
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

            <p
              className="mt-6 text-center text-xs lg:text-left"
              style={{ color: 'var(--text-muted)' }}
            >
              Secure access for admins and employees.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;