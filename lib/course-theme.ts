import { Course } from "@/lib/types";

const courseThemes = [
  {
    id: "coral",
    name: "Coral",
    band: "bg-[#e76f51]",
    chip: "bg-[#f7e8e3] text-stone-600",
    progressFill: "bg-[#e76f51]",
    tableHeader: "bg-[#f7e8e3] text-[#9d4b34]",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(231,111,81,0.28), rgba(231,111,81,0.28) 4px, rgba(255,244,240,0.96) 4px, rgba(255,244,240,0.96) 9px)",
    markerBorder: "border-[#cf684d]",
    markerText: "text-[#9d4b34]",
    markerLine: "border-[#cf684d]/70",
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
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(94,166,234,0.28), rgba(94,166,234,0.28) 4px, rgba(243,249,255,0.96) 4px, rgba(243,249,255,0.96) 9px)",
    markerBorder: "border-[#5ea6ea]",
    markerText: "text-[#3b76ae]",
    markerLine: "border-[#5ea6ea]/70",
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
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(65,179,162,0.28), rgba(65,179,162,0.28) 4px, rgba(241,251,248,0.96) 4px, rgba(241,251,248,0.96) 9px)",
    markerBorder: "border-[#41b3a2]",
    markerText: "text-[#2b8073]",
    markerLine: "border-[#41b3a2]/70",
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
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(212,163,115,0.3), rgba(212,163,115,0.3) 4px, rgba(251,246,240,0.96) 4px, rgba(251,246,240,0.96) 9px)",
    markerBorder: "border-[#c79363]",
    markerText: "text-[#946d46]",
    markerLine: "border-[#c79363]/70",
    neededText: "text-[#946d46]",
    neededMuted: "text-[#a18160]",
  },
  {
    id: "gold",
    name: "Gold",
    band: "bg-[#e9c46a]",
    chip: "bg-[#fbf4df] text-stone-600",
    progressFill: "bg-[#e9c46a]",
    tableHeader: "bg-[#fcf4de] text-[#9a7e2f]",
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(233,196,106,0.3), rgba(233,196,106,0.3) 4px, rgba(255,250,239,0.96) 4px, rgba(255,250,239,0.96) 9px)",
    markerBorder: "border-[#d8b253]",
    markerText: "text-[#9a7e2f]",
    markerLine: "border-[#d8b253]/70",
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
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(155,93,229,0.28), rgba(155,93,229,0.28) 4px, rgba(249,245,255,0.96) 4px, rgba(249,245,255,0.96) 9px)",
    markerBorder: "border-[#9b5de5]",
    markerText: "text-[#7042a8]",
    markerLine: "border-[#9b5de5]/70",
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
    chartStripe:
      "repeating-linear-gradient(135deg, rgba(76,175,80,0.28), rgba(76,175,80,0.28) 4px, rgba(243,250,243,0.96) 4px, rgba(243,250,243,0.96) 9px)",
    markerBorder: "border-[#4caf50]",
    markerText: "text-[#36793a]",
    markerLine: "border-[#4caf50]/70",
    neededText: "text-[#36793a]",
    neededMuted: "text-[#648a67]",
  },
];

export const courseThemeOptions = courseThemes;

export function getCourseThemeById(themeId: string) {
  return courseThemes.find((theme) => theme.id === themeId) ?? null;
}

export function getCourseTheme(course: Course) {
  const selectedTheme = getCourseThemeById(course.accent);

  if (selectedTheme) {
    return selectedTheme;
  }

  const seed = Array.from(course.id).reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);

  return courseThemes[seed % courseThemes.length];
}
