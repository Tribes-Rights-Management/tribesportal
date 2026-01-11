/**
 * Theme utilities for Vite + React (no next-themes)
 * Handles Light/Dark/System with localStorage persistence
 */

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "tribes.themeMode";

export function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return getSystemPrefersDark() ? "dark" : "light";
  return mode;
}

export function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }
  return "system";
}
