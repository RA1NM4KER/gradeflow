import {
  RESOLVED_THEME_DARK,
  RESOLVED_THEME_LIGHT,
  ResolvedTheme,
  THEME_MODES,
  THEME_MODE_SYSTEM,
  ThemeMode,
  THEME_MODE_LIGHT,
  THEME_MODE_DARK,
} from "@/lib/theme/types";

export type { ResolvedTheme, ThemeMode } from "@/lib/theme/types";
export { THEME_MODES, THEME_MODE_SYSTEM } from "@/lib/theme/types";

export const THEME_STORAGE_KEY = "gradelog-theme";

export function isThemeMode(
  value: string | null | undefined,
): value is ThemeMode {
  return typeof value === "string" && THEME_MODES.includes(value as ThemeMode);
}

export function resolveTheme(
  mode: ThemeMode,
  prefersDark: boolean,
): ResolvedTheme {
  if (mode === THEME_MODE_SYSTEM) {
    return prefersDark ? RESOLVED_THEME_DARK : RESOLVED_THEME_LIGHT;
  }

  return mode;
}

export function getThemeInitializerScript() {
  return `
(() => {
  const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
  const themeModeSystem = ${JSON.stringify(THEME_MODE_SYSTEM)};
  const themeModeLight = ${JSON.stringify(THEME_MODE_LIGHT)};
  const themeModeDark = ${JSON.stringify(THEME_MODE_DARK)};
  const resolvedThemeLight = ${JSON.stringify(RESOLVED_THEME_LIGHT)};
  const resolvedThemeDark = ${JSON.stringify(RESOLVED_THEME_DARK)};
  const root = document.documentElement;
  const storedTheme = window.localStorage.getItem(storageKey);
  const theme =
    storedTheme === themeModeLight ||
    storedTheme === themeModeDark ||
    storedTheme === themeModeSystem
      ? storedTheme
      : themeModeSystem;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolvedTheme =
    theme === themeModeSystem
      ? prefersDark
        ? resolvedThemeDark
        : resolvedThemeLight
      : theme;

  root.classList.toggle("dark", resolvedTheme === resolvedThemeDark);
  root.style.colorScheme = resolvedTheme;
})();
`.trim();
}
