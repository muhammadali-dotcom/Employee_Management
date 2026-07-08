'use client';

// ─────────────────────────────────────────────────────────────────────────────
// components/auth/GoogleLoginButton.tsx  —  GOOGLE IDENTITY SERVICES BUTTON
//
// Loads Google's client-side SDK, renders Google's own "Sign in with Google"
// button, and hands the resulting ID token (a signed JWT from Google) up to
// the caller via onCredential. This component never talks to our backend —
// it only knows how to get a token out of Google. AuthContext decides what
// to do with that token (POST it to /api/auth/google).
// ─────────────────────────────────────────────────────────────────────────────

import Script from 'next/script';
import { useCallback, useRef, useState } from 'react';

interface GoogleCredentialResponse {
  credential: string; // the ID token
}

interface GoogleLoginButtonProps {
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const GoogleLoginButton = ({ onCredential, disabled }: GoogleLoginButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptError, setScriptError] = useState('');

  const initializeGoogleButton = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      setScriptError('Google login is not configured.');
      return;
    }

    // window.google is injected by the script we load below.
    const google = (window as unknown as { google?: any }).google;
    if (!google || !buttonRef.current) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: GoogleCredentialResponse) => {
        onCredential(response.credential);
      },
    });

    google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
    });
  }, [onCredential]);

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogleButton}
        onError={() => setScriptError('Could not load Google Sign-In. Check your connection.')}
      />

      {scriptError ? (
        <p className="text-center text-xs font-semibold" style={{ color: 'var(--danger)' }}>
          {scriptError}
        </p>
      ) : (
        <div
          ref={buttonRef}
          aria-disabled={disabled}
          style={disabled ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
        />
      )}
    </div>
  );
};
