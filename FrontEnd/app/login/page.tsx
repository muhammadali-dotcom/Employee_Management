'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

const LoginPage = () => {
  const { login, loginWithGoogle, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [emailErr, setEmailErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

  const handleGoogleCredential = useCallback(async (idToken: string) => {
    setError('');
    setGoogleLoading(true);

    try {
      await loginWithGoogle(idToken);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google login failed';

      if (msg.includes('No account found')) {
        setError('No account found for this Google email. Contact your admin to get access.');
      } else if (msg.includes('not verified')) {
        setError('Your Google email is not verified. Please verify it with Google first.');
      } else {
        setError(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle]);

  const inputStyle = {
    color: 'var(--text-primary)',
    WebkitTextFillColor: 'var(--text-primary)',
    caretColor: 'var(--text-primary)',
    WebkitBoxShadow: '0 0 0 1000px var(--input-bg) inset',
    boxShadow: 'none',
    border: 'none',
    outline: 'none',
    // Inline style beats the global `input { background: var(--input-bg) }`
    // rule unambiguously (no !important/specificity guessing needed) — the
    // wrapper div already supplies the visible background.
    background: 'transparent',
    backgroundColor: 'transparent',
    transition: 'background-color 9999s ease-in-out 0s',
  };

  const getWrapperStyle = (hasError: boolean, isFocused: boolean) => ({
    background: 'var(--input-bg)',
    borderColor: hasError
      ? 'rgba(255, 77, 79, 0.45)'
      : isFocused
        ? 'var(--border-accent)'
        : 'var(--input-border)',
    boxShadow: hasError
      ? '0 0 0 4px var(--danger-soft)'
      : isFocused
        ? '0 0 0 4px var(--accent-soft)'
        : 'none',
  });

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

        /* Prevent the global input rule from adding a second border/shadow on login inputs.
           -webkit-appearance/appearance strip the browser's native input chrome, which
           otherwise paints its own background box on top of ours (most visible in dark mode). */
        .login-input-field {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          -webkit-appearance: none;
          appearance: none;
        }

        .login-input-field:focus {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
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
              Manage your team with clarity and control.
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
                  className="flex h-12 items-center gap-3 rounded-2xl border px-4 transition-all duration-200"
                  style={getWrapperStyle(!!emailErr, emailFocused)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>

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
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="you@company.com"
                    aria-invalid={!!emailErr}
                    aria-describedby={emailErr ? 'email-error' : undefined}
                    className="login-input-field w-full bg-transparent text-sm placeholder:text-[color:var(--text-muted)]"
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
                  className="flex h-12 items-center gap-3 rounded-2xl border px-4 transition-all duration-200"
                  style={getWrapperStyle(!!passwordErr, passwordFocused)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>

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
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="••••••••"
                    aria-invalid={!!passwordErr}
                    aria-describedby={passwordErr ? 'password-error' : undefined}
                    className="login-input-field w-full bg-transparent text-sm placeholder:text-[color:var(--text-muted)]"
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

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                OR
              </span>
              <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            </div>

            <div className="flex justify-center">
              <GoogleLoginButton onCredential={handleGoogleCredential} disabled={loading || googleLoading} />
            </div>

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