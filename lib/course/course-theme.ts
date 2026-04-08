import { Course, CourseTheme, CourseThemeMode } from "@/lib/course/types";

const courseThemes = [
  {
    id: "coral",
    name: "Coral",
    band: "bg-course-coral",
    chip: "bg-course-coral-soft text-stone-600",
    progressFill: "bg-course-coral",
    tableHeader: "bg-course-coral-soft text-course-coral",
    tableHeaderDark: "bg-course-coral-header text-course-coral-foreground",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(231,111,81,0.28), rgba(231,111,81,0.28) 4px, rgba(255,244,240,0.96) 4px, rgba(255,244,240,0.96) 9px)",
    markerBorder: "border-course-coral",
    markerText: "text-course-coral",
    markerLine: "border-course-coral-line",
    chartMarkerBorder: "border-course-coral-soft",
    chartMarkerText: "text-course-coral-soft",
    chartMarkerLine: "border-course-coral-soft",
    neededText: "text-course-coral",
    neededMuted: "text-course-coral-muted",
  },
  {
    id: "blue",
    name: "Blue",
    band: "bg-course-blue",
    chip: "bg-course-blue-soft text-stone-600",
    progressFill: "bg-course-blue",
    tableHeader: "bg-course-blue-soft text-course-blue",
    tableHeaderDark: "bg-course-blue-header text-course-blue-foreground",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(94,166,234,0.28), rgba(94,166,234,0.28) 4px, rgba(243,249,255,0.96) 4px, rgba(243,249,255,0.96) 9px)",
    markerBorder: "border-course-blue",
    markerText: "text-course-blue",
    markerLine: "border-course-blue-line",
    chartMarkerBorder: "border-course-blue-soft",
    chartMarkerText: "text-course-blue-soft",
    chartMarkerLine: "border-course-blue-soft",
    neededText: "text-course-blue",
    neededMuted: "text-course-blue-muted",
  },
  {
    id: "teal",
    name: "Teal",
    band: "bg-course-teal",
    chip: "bg-course-teal-soft text-stone-600",
    progressFill: "bg-course-teal",
    tableHeader: "bg-course-teal-soft text-course-teal",
    tableHeaderDark: "bg-course-teal text-course-teal-foreground",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(65,179,162,0.28), rgba(65,179,162,0.28) 4px, rgba(241,251,248,0.96) 4px, rgba(241,251,248,0.96) 9px)",
    markerBorder: "border-course-teal",
    markerText: "text-course-teal",
    markerLine: "border-course-teal-line",
    chartMarkerBorder: "border-course-teal-soft",
    chartMarkerText: "text-course-teal-soft",
    chartMarkerLine: "border-course-teal-soft",
    neededText: "text-course-teal",
    neededMuted: "text-course-teal-muted",
  },
  {
    id: "sand",
    name: "Sand",
    band: "bg-course-sand",
    chip: "bg-course-sand-soft text-stone-600",
    progressFill: "bg-course-sand",
    tableHeader: "bg-course-sand-soft text-course-sand",
    tableHeaderDark: "bg-course-sand-header text-course-sand-foreground",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(212,163,115,0.3), rgba(212,163,115,0.3) 4px, rgba(251,246,240,0.96) 4px, rgba(251,246,240,0.96) 9px)",
    markerBorder: "border-course-sand",
    markerText: "text-course-sand",
    markerLine: "border-course-sand-line",
    chartMarkerBorder: "border-course-sand-soft",
    chartMarkerText: "text-course-sand-soft",
    chartMarkerLine: "border-course-sand-soft",
    neededText: "text-course-sand",
    neededMuted: "text-course-sand-muted",
  },
  {
    id: "pink",
    name: "Pink",
    band: "bg-course-pink",
    chip: "bg-course-pink-soft text-stone-600",
    progressFill: "bg-course-pink",
    tableHeader: "bg-course-pink-soft text-course-pink",
    tableHeaderDark: "bg-course-pink-header text-course-pink-foreground",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(242,156,188,0.3), rgba(242,156,188,0.3) 4px, rgba(255,246,250,0.96) 4px, rgba(255,246,250,0.96) 9px)",
    markerBorder: "border-course-pink",
    markerText: "text-course-pink",
    markerLine: "border-course-pink-line",
    chartMarkerBorder: "border-course-pink-soft",
    chartMarkerText: "text-course-pink-soft",
    chartMarkerLine: "border-course-pink-soft",
    neededText: "text-course-pink",
    neededMuted: "text-course-pink-muted",
  },
  {
    id: "gold",
    name: "Gold",
    band: "bg-course-gold",
    chip: "bg-course-gold-soft text-stone-600",
    progressFill: "bg-course-gold",
    tableHeader: "bg-course-gold-soft text-course-gold",
    tableHeaderDark: "bg-course-gold-header text-course-gold-foreground",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(233,196,106,0.3), rgba(233,196,106,0.3) 4px, rgba(255,250,239,0.96) 4px, rgba(255,250,239,0.96) 9px)",
    markerBorder: "border-course-gold",
    markerText: "text-course-gold",
    markerLine: "border-course-gold-line",
    chartMarkerBorder: "border-course-gold-soft",
    chartMarkerText: "text-course-gold-soft",
    chartMarkerLine: "border-course-gold-soft",
    neededText: "text-course-gold",
    neededMuted: "text-course-gold-muted",
  },
  {
    id: "violet",
    name: "Violet",
    band: "bg-course-violet",
    chip: "bg-course-violet-soft text-stone-600",
    progressFill: "bg-course-violet",
    tableHeader: "bg-course-violet-soft text-course-violet",
    tableHeaderDark: "bg-course-violet-header text-course-violet-foreground",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(155,93,229,0.28), rgba(155,93,229,0.28) 4px, rgba(249,245,255,0.96) 4px, rgba(249,245,255,0.96) 9px)",
    markerBorder: "border-course-violet",
    markerText: "text-course-violet",
    markerLine: "border-course-violet-line",
    chartMarkerBorder: "border-course-violet-soft",
    chartMarkerText: "text-course-violet-soft",
    chartMarkerLine: "border-course-violet-soft",
    neededText: "text-course-violet",
    neededMuted: "text-course-violet-muted",
  },
  {
    id: "green",
    name: "Green",
    band: "bg-course-green",
    chip: "bg-course-green-soft text-stone-600",
    progressFill: "bg-course-green",
    tableHeader: "bg-course-green-soft text-course-green",
    tableHeaderDark: "bg-course-green-header text-course-green-foreground",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(76,175,80,0.28), rgba(76,175,80,0.28) 4px, rgba(243,250,243,0.96) 4px, rgba(243,250,243,0.96) 9px)",
    markerBorder: "border-course-green",
    markerText: "text-course-green",
    markerLine: "border-course-green-line",
    chartMarkerBorder: "border-course-green-soft",
    chartMarkerText: "text-course-green-soft",
    chartMarkerLine: "border-course-green-soft",
    neededText: "text-course-green",
    neededMuted: "text-course-green-muted",
  },
];

export const courseThemeOptions = courseThemes;

export function getCourseThemeById(themeId: string) {
  return courseThemes.find((theme) => theme.id === themeId) ?? null;
}

export function getCourseTheme(
  course: Course,
  mode: CourseThemeMode = "light",
): CourseTheme {
  const selectedTheme = getCourseThemeById(course.accent);
  const seed = Array.from(course.id).reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);
  const baseTheme = selectedTheme ?? courseThemes[seed % courseThemes.length];

  return {
    ...baseTheme,
    chartAccentBorder:
      mode === "dark" ? baseTheme.chartMarkerBorder : baseTheme.markerBorder,
    chartAccentLine:
      mode === "dark" ? baseTheme.chartMarkerLine : baseTheme.markerLine,
    chartAccentText:
      mode === "dark" ? baseTheme.chartMarkerText : baseTheme.markerText,
    chartAccentTextMuted:
      mode === "dark" ? baseTheme.chartMarkerText : baseTheme.neededMuted,
    neededAccentText:
      mode === "dark" ? baseTheme.chartMarkerText : baseTheme.neededText,
    tableHeaderAccent:
      mode === "dark" ? baseTheme.tableHeaderDark : baseTheme.tableHeader,
  };
}
