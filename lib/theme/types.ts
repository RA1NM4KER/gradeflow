export const THEME_MODE_SYSTEM = "system";
export const THEME_MODE_LIGHT = "light";
export const THEME_MODE_DARK = "dark";

export const THEME_MODES = [
  THEME_MODE_SYSTEM,
  THEME_MODE_LIGHT,
  THEME_MODE_DARK,
] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const RESOLVED_THEME_LIGHT = "light";
export const RESOLVED_THEME_DARK = "dark";

export const RESOLVED_THEMES = [
  RESOLVED_THEME_LIGHT,
  RESOLVED_THEME_DARK,
] as const;
export type ResolvedTheme = (typeof RESOLVED_THEMES)[number];
