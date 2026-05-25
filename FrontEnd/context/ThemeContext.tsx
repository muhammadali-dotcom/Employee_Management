'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // On first load, read saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ems_theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
  }, []);

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('ems_theme', next);
    // Add/remove "dark" class on <html> — Tailwind uses this for dark: variants
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook — any component can call useTheme() to get theme + toggleTheme
export function useTheme() {
  return useContext(ThemeContext);
}
