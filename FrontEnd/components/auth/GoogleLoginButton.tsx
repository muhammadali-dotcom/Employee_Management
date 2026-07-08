'use client';

// ─────────────────────────────────────────────────────────────────────────────
// components/auth/GoogleLoginButton.tsx  —  GOOGLE IDENTITY SERVICES BUTTON
// ─────────────────────────────────────────────────────────────────────────────

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;

  renderButton: (
    parent: HTMLElement,
    options: {
      type: 'standard';
      theme: 'outline';
      size: 'large';
      width: number;
      text: 'continue_with';
    },
  ) => void;
}

interface GoogleIdentityServices {
  accounts: {
    id: GoogleAccountsId;
  };
}

interface GoogleWindow extends Window {
  google?: GoogleIdentityServices;
}

interface GoogleLoginButtonProps {
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

export const GoogleLoginButton = ({
  onCredential,
  disabled,
}: GoogleLoginButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptError, setScriptError] = useState('');

  const initializeGoogleButton = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      setScriptError(
        'Google login is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to FrontEnd/.env.local and restart the app.',
      );
      return;
    }

    setScriptError('');

    const google = (window as GoogleWindow).google;

    if (!google || !buttonRef.current) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: GoogleCredentialResponse) => {
        if (!response.credential) {
          setScriptError('Google login failed. No credential received.');
          return;
        }

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

  useEffect(() => {
    if ((window as GoogleWindow).google) {
      initializeGoogleButton();
    }
  }, [initializeGoogleButton]);

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogleButton}
        onError={() =>
          setScriptError('Could not load Google Sign-In. Check your connection.')
        }
      />

      {scriptError ? (
        <p
          className="text-center text-xs font-semibold"
          style={{ color: 'var(--danger)' }}
        >
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