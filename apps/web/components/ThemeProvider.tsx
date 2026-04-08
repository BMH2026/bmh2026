'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dawn' | 'day' | 'dusk' | 'night';

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('day');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      let currentTheme: Theme = 'day';
      
      if (hour >= 5 && hour < 8) currentTheme = 'dawn';
      else if (hour >= 8 && hour < 16) currentTheme = 'day';
      else if (hour >= 16 && hour < 19) currentTheme = 'dusk';
      else currentTheme = 'night';
      
      setTheme(currentTheme);
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!window.location.pathname.startsWith('/admin')) {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
