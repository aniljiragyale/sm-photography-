'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('sm-site-theme');
    const initialTheme: Theme = savedTheme === 'dark' ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = nextTheme;
      window.localStorage.setItem('sm-site-theme', nextTheme);
      return nextTheme;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useSiteTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useSiteTheme must be used within SiteThemeProvider.');
  return context;
}
