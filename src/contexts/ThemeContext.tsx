/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THEME CONTEXT — Light/Dark Mode Management
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Manages application theme state with:
 * - localStorage persistence for user preference
 * - Default: LIGHT mode (system preference detection DISABLED)
 * - Real-time toggle without page refresh
 * 
 * DESIGN SPEC: Stripe-grade light theme is the standard.
 * Auth pages use dark via CSS variables (no class toggle needed).
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
    // Check localStorage for user preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    // ALWAYS default to light mode - ignore system preference
    // Per design spec: Stripe-grade light theme is the standard
    return 'light';
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

  // NOTE: System preference detection disabled
  // We always default to light mode per design spec
  // Users can manually toggle to dark if they prefer

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
