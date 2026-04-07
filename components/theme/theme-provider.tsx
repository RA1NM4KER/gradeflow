"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  isThemeMode,
  resolveTheme,
  THEME_MODES,
  THEME_MODE_SYSTEM,
  THEME_STORAGE_KEY,
} from "@/lib/theme/theme";
import {
  RESOLVED_THEME_DARK,
  RESOLVED_THEME_LIGHT,
  ResolvedTheme,
  ThemeMode,
} from "@/lib/theme/types";

interface ThemeContextValue {
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
  theme: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeToDocument(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === RESOLVED_THEME_DARK);
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(THEME_MODE_SYSTEM);
  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>(RESOLVED_THEME_LIGHT);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initialTheme = isThemeMode(storedTheme)
      ? storedTheme
      : THEME_MODE_SYSTEM;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function updateResolvedTheme(mode: ThemeMode) {
      const nextResolvedTheme = resolveTheme(mode, mediaQuery.matches);
      setResolvedTheme(nextResolvedTheme);
      applyThemeToDocument(nextResolvedTheme);
    }

    function handleSystemThemeChange(event: MediaQueryListEvent) {
      setResolvedTheme((currentResolvedTheme) => {
        const currentTheme = isThemeMode(
          window.localStorage.getItem(THEME_STORAGE_KEY),
        )
          ? (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode)
          : THEME_MODE_SYSTEM;

        if (currentTheme !== THEME_MODE_SYSTEM) {
          return currentResolvedTheme;
        }

        const nextResolvedTheme = event.matches
          ? RESOLVED_THEME_DARK
          : RESOLVED_THEME_LIGHT;
        applyThemeToDocument(nextResolvedTheme);
        return nextResolvedTheme;
      });
    }

    setThemeState(initialTheme);
    updateResolvedTheme(initialTheme);
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      resolvedTheme,
      setTheme: (mode) => {
        if (!THEME_MODES.includes(mode)) {
          return;
        }

        setThemeState(mode);
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);

        const nextResolvedTheme = resolveTheme(mode, getSystemPreference());
        setResolvedTheme(nextResolvedTheme);
        applyThemeToDocument(nextResolvedTheme);
      },
      theme,
    }),
    [resolvedTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
