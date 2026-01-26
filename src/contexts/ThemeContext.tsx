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
  // LIGHT-LOCK GUARDRAIL: Always force light theme
  // This runs synchronously before first render to prevent flicker
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      
      // ONE-TIME MIGRATION: If stored value is not "light", fix it
      if (stored !== 'light') {
        localStorage.setItem(THEME_STORAGE_KEY, 'light');
      }
      
      // Immediately clean up any dark class that might be on <html>
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // ALWAYS return light - ignore stored value, ignore system preference
    return 'light';
  });

  // Apply theme class to document (reinforces light theme)
  useEffect(() => {
    const root = document.documentElement;
    
    // GUARDRAIL: Always enforce light theme, even if state somehow changed
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    
    // Persist light to localStorage (ensures consistency)
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
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
    
    // Force dark for this layout (e.g., auth pages)
    root.classList.remove('light');
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    
    // Restore light on unmount (light-lock guardrail)
    return () => {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    };
  }, []);
}
