import {
  RESOLVED_THEME_DARK,
  RESOLVED_THEME_LIGHT,
  ResolvedTheme,
  THEME_MODES,
  THEME_MODE_SYSTEM,
  ThemeMode,
} from "@/lib/theme/types";

export type { ResolvedTheme, ThemeMode } from "@/lib/theme/types";
export {
  THEME_MODES,
  THEME_MODE_DARK,
  THEME_MODE_LIGHT,
  THEME_MODE_SYSTEM,
} from "@/lib/theme/types";

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
