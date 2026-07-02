import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider }  from '@/context/AuthContext';
import './globals.css';

const geist = localFont({
  src: '../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2',
  variable: '--font-geist',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Employee Management System',
  description: 'Manage your team with ease',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
