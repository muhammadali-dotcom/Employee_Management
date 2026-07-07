'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import RouteGuard from '@/components/auth/RouteGuard';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <RouteGuard>
      <div
        className="min-h-[100dvh] overflow-auto p-2 sm:p-3 lg:p-4"
        style={{
          background: 'transparent',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex min-h-full gap-0 lg:gap-5">
          <Sidebar
            mobileOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
          />

          <section
            className="flex min-w-0 flex-1 flex-col rounded-[var(--radius-xl)] border"
            style={{
              background:
                'linear-gradient(135deg, var(--bg-surface), var(--bg-surface-soft))',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
              backdropFilter: 'var(--blur)',
              WebkitBackdropFilter: 'var(--blur)',
            }}
          >
            <div className="flex-shrink-0">
              <Header onMenuClick={() => setMobileNavOpen(true)} />
            </div>

            <main className="flex-1 p-3 sm:p-4">
              {children}
            </main>
          </section>
        </div>
      </div>
    </RouteGuard>
  );
};

export default AppShell;