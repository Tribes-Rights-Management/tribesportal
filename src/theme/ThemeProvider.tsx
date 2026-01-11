import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  ThemeMode,
  ResolvedTheme,
  THEME_STORAGE_KEY,
  applyThemeClass,
  resolveTheme,
  getSystemPrefersDark,
  getStoredTheme,
} from "./theme";

interface ThemeContextValue {
  /** Current user selection: light | dark | system */
  theme: ThemeMode;
  /** Actual applied theme after resolving "system" */
  resolvedTheme: ResolvedTheme;
  /** Update theme preference */
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);

  const resolvedTheme = useMemo<ResolvedTheme>(
    () => resolveTheme(theme),
    [theme]
  );

  // Persist to localStorage and apply class when theme changes
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyThemeClass(resolvedTheme);
  }, [theme, resolvedTheme]);

  // Listen for OS theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyThemeClass(getSystemPrefersDark() ? "dark" : "light");
    };

    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
