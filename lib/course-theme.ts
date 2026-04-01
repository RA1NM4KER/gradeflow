import { Course } from "@/lib/types";

type CourseThemeMode = "light" | "dark";

const courseThemes = [
  {
    id: "coral",
    name: "Coral",
    band: "bg-[#e76f51]",
    chip: "bg-[#f7e8e3] text-stone-600",
    progressFill: "bg-[#e76f51]",
    tableHeader: "bg-[#f7e8e3] text-[#9d4b34]",
    tableHeaderDark: "bg-[#cf684d] text-[#fff7f4]",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(231,111,81,0.28), rgba(231,111,81,0.28) 4px, rgba(255,244,240,0.96) 4px, rgba(255,244,240,0.96) 9px)",
    markerBorder: "border-[#cf684d]",
    markerText: "text-[#9d4b34]",
    markerLine: "border-[#cf684d]/70",
    chartMarkerBorder: "border-[#e7b3a4]",
    chartMarkerText: "text-[#e7b3a4]",
    chartMarkerLine: "border-[#e7b3a4]",
    neededText: "text-[#9d4b34]",
    neededMuted: "text-[#bf7a66]",
  },
  {
    id: "blue",
    name: "Blue",
    band: "bg-[#5ea6ea]",
    chip: "bg-[#eef3f8] text-stone-600",
    progressFill: "bg-[#5ea6ea]",
    tableHeader: "bg-[#e8f1fb] text-[#3b76ae]",
    tableHeaderDark: "bg-[#5ea6ea] text-[#f5fbff]",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(94,166,234,0.28), rgba(94,166,234,0.28) 4px, rgba(243,249,255,0.96) 4px, rgba(243,249,255,0.96) 9px)",
    markerBorder: "border-[#5ea6ea]",
    markerText: "text-[#3b76ae]",
    markerLine: "border-[#5ea6ea]/70",
    chartMarkerBorder: "border-[#b8d7f5]",
    chartMarkerText: "text-[#b8d7f5]",
    chartMarkerLine: "border-[#b8d7f5]",
    neededText: "text-[#3b76ae]",
    neededMuted: "text-[#7295b8]",
  },
  {
    id: "teal",
    name: "Teal",
    band: "bg-[#41b3a2]",
    chip: "bg-[#e8f6f3] text-stone-600",
    progressFill: "bg-[#41b3a2]",
    tableHeader: "bg-[#e5f6f2] text-[#2b8073]",
    tableHeaderDark: "bg-[#41b3a2] text-[#f2fffc]",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(65,179,162,0.28), rgba(65,179,162,0.28) 4px, rgba(241,251,248,0.96) 4px, rgba(241,251,248,0.96) 9px)",
    markerBorder: "border-[#41b3a2]",
    markerText: "text-[#2b8073]",
    markerLine: "border-[#41b3a2]/70",
    chartMarkerBorder: "border-[#9fdccf]",
    chartMarkerText: "text-[#9fdccf]",
    chartMarkerLine: "border-[#9fdccf]",
    neededText: "text-[#2b8073]",
    neededMuted: "text-[#5b958c]",
  },
  {
    id: "sand",
    name: "Sand",
    band: "bg-[#d4a373]",
    chip: "bg-[#f6eee6] text-stone-600",
    progressFill: "bg-[#d4a373]",
    tableHeader: "bg-[#f6ece2] text-[#946d46]",
    tableHeaderDark: "bg-[#c79363] text-[#fff9f3]",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(212,163,115,0.3), rgba(212,163,115,0.3) 4px, rgba(251,246,240,0.96) 4px, rgba(251,246,240,0.96) 9px)",
    markerBorder: "border-[#c79363]",
    markerText: "text-[#946d46]",
    markerLine: "border-[#c79363]/70",
    chartMarkerBorder: "border-[#e3c7aa]",
    chartMarkerText: "text-[#e3c7aa]",
    chartMarkerLine: "border-[#e3c7aa]",
    neededText: "text-[#946d46]",
    neededMuted: "text-[#a18160]",
  },
  {
    id: "pink",
    name: "Pink",
    band: "bg-[#f29cbc]",
    chip: "bg-[#fdebf2] text-stone-600",
    progressFill: "bg-[#f29cbc]",
    tableHeader: "bg-[#fdebf2] text-[#b85d83]",
    tableHeaderDark: "bg-[#ea86af] text-[#fff7fb]",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(242,156,188,0.3), rgba(242,156,188,0.3) 4px, rgba(255,246,250,0.96) 4px, rgba(255,246,250,0.96) 9px)",
    markerBorder: "border-[#ea86af]",
    markerText: "text-[#b85d83]",
    markerLine: "border-[#ea86af]/70",
    chartMarkerBorder: "border-[#f6bfd3]",
    chartMarkerText: "text-[#f6bfd3]",
    chartMarkerLine: "border-[#f6bfd3]",
    neededText: "text-[#b85d83]",
    neededMuted: "text-[#c585a1]",
  },
  {
    id: "gold",
    name: "Gold",
    band: "bg-[#e9c46a]",
    chip: "bg-[#fbf4df] text-stone-600",
    progressFill: "bg-[#e9c46a]",
    tableHeader: "bg-[#fcf4de] text-[#9a7e2f]",
    tableHeaderDark: "bg-[#d8b253] text-[#fffcef]",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(233,196,106,0.3), rgba(233,196,106,0.3) 4px, rgba(255,250,239,0.96) 4px, rgba(255,250,239,0.96) 9px)",
    markerBorder: "border-[#d8b253]",
    markerText: "text-[#9a7e2f]",
    markerLine: "border-[#d8b253]/70",
    chartMarkerBorder: "border-[#f0dfad]",
    chartMarkerText: "text-[#f0dfad]",
    chartMarkerLine: "border-[#f0dfad]",
    neededText: "text-[#9a7e2f]",
    neededMuted: "text-[#ab9150]",
  },
  {
    id: "violet",
    name: "Violet",
    band: "bg-[#9b5de5]",
    chip: "bg-[#f1e9fd] text-stone-600",
    progressFill: "bg-[#9b5de5]",
    tableHeader: "bg-[#f1e9fd] text-[#7042a8]",
    tableHeaderDark: "bg-[#9b5de5] text-[#faf5ff]",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(155,93,229,0.28), rgba(155,93,229,0.28) 4px, rgba(249,245,255,0.96) 4px, rgba(249,245,255,0.96) 9px)",
    markerBorder: "border-[#9b5de5]",
    markerText: "text-[#7042a8]",
    markerLine: "border-[#9b5de5]/70",
    chartMarkerBorder: "border-[#d0b2f4]",
    chartMarkerText: "text-[#d0b2f4]",
    chartMarkerLine: "border-[#d0b2f4]",
    neededText: "text-[#7042a8]",
    neededMuted: "text-[#8767af]",
  },
  {
    id: "green",
    name: "Green",
    band: "bg-[#4caf50]",
    chip: "bg-[#e7f5e8] text-stone-600",
    progressFill: "bg-[#4caf50]",
    tableHeader: "bg-[#e6f4e8] text-[#36793a]",
    tableHeaderDark: "bg-[#4caf50] text-[#f4fff4]",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(76,175,80,0.28), rgba(76,175,80,0.28) 4px, rgba(243,250,243,0.96) 4px, rgba(243,250,243,0.96) 9px)",
    markerBorder: "border-[#4caf50]",
    markerText: "text-[#36793a]",
    markerLine: "border-[#4caf50]/70",
    chartMarkerBorder: "border-[#a8d9aa]",
    chartMarkerText: "text-[#a8d9aa]",
    chartMarkerLine: "border-[#a8d9aa]",
    neededText: "text-[#36793a]",
    neededMuted: "text-[#648a67]",
  },
];

export const courseThemeOptions = courseThemes;
export type CourseTheme = (typeof courseThemes)[number] & {
  chartAccentBorder: string;
  chartAccentLine: string;
  chartAccentText: string;
  neededAccentText: string;
  tableHeaderAccent: string;
};

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
    neededAccentText:
      mode === "dark" ? baseTheme.chartMarkerText : baseTheme.neededText,
    tableHeaderAccent:
      mode === "dark" ? baseTheme.tableHeaderDark : baseTheme.tableHeader,
  };
}
