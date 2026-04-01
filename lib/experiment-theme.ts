import { ResolvedTheme } from "@/lib/theme";

export function getExperimentTheme(mode: ResolvedTheme) {
  if (mode === "dark") {
    return {
      accentBackground: "bg-violet-300/12",
      accentBackgroundSoft: "bg-violet-300/10",
      accentBackgroundStronger: "bg-violet-300/16",
      headerBackground: "bg-[#2b183d]",
      accentBorder: "border-violet-300/55",
      accentBorderSoft: "border-violet-300/35",
      accentLine: "border-violet-300/70",
      accentPing1: "bg-violet-300/65",
      accentPing2: "bg-violet-200/70",
      accentPing3: "bg-violet-100/80",
      accentText: "text-violet-300",
      accentTextMuted: "text-violet-200/78",
      accentTextSoft: "text-violet-300/82",
      accentTextStrong: "text-violet-200",
      hoverText: "hover:text-violet-300",
    };
  }

  return {
    accentBackground: "bg-violet-50",
    accentBackgroundSoft: "bg-violet-50",
    accentBackgroundStronger: "bg-violet-50",
    headerBackground: "bg-violet-50",
    accentBorder: "border-violet-200",
    accentBorderSoft: "border-violet-200",
    accentLine: "border-violet-600",
    accentPing1: "bg-violet-400/80",
    accentPing2: "bg-violet-300/90",
    accentPing3: "bg-violet-200/90",
    accentText: "text-violet-700",
    accentTextMuted: "text-violet-500",
    accentTextSoft: "text-violet-600",
    accentTextStrong: "text-violet-900",
    hoverText: "hover:text-violet-600",
  };
}
