/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THEME CONTEXT — Light/Dark Mode Management
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Manages application theme state with:
 * - localStorage persistence
 * - System preference detection (prefers-color-scheme)
 * - Real-time toggle without page refresh
 * 
 * Default: Light mode
 * Auth pages: Always dark (override via AuthLayout)
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'tribes-theme-preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Fall back to system preference, defaulting to light
      // Note: We default to light even if no system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light'; // Default to light mode
  });

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    // Persist to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      isDark: theme === 'dark' 
    }}>
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

/**
 * Hook to force dark theme for specific pages (like auth)
 * Call this in layouts that should always be dark
 */
export function useForceDarkTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.getAttribute('data-theme');
    
    // Force dark
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    
    // Restore on unmount
    return () => {
      if (previousTheme === 'light') {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    };
  }, []);
}
