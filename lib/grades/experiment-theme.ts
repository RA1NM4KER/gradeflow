import { ResolvedTheme } from "@/lib/theme/types";

export function getExperimentTheme(mode: ResolvedTheme) {
  if (mode === "dark") {
    return {
      accentBackground: "bg-experiment-accent",
      accentBackgroundSoft: "bg-experiment-accent-soft",
      accentBackgroundStronger: "bg-experiment-accent-strong",
      headerBackground: "bg-experiment-header",
      accentBorder: "border-experiment-accent",
      accentBorderSoft: "border-experiment-accent-soft",
      accentLine: "border-experiment-accent-line",
      accentPing1: "bg-experiment-ping-1",
      accentPing2: "bg-experiment-ping-2",
      accentPing3: "bg-experiment-ping-3",
      accentText: "text-experiment-accent",
      accentTextMuted: "text-experiment-accent-muted",
      accentTextSoft: "text-experiment-accent-soft",
      accentTextStrong: "text-experiment-accent-strong",
      hoverText: "hover:text-experiment-accent",
    };
  }

  return {
    accentBackground: "bg-experiment-accent",
    accentBackgroundSoft: "bg-experiment-accent-soft",
    accentBackgroundStronger: "bg-experiment-accent-strong",
    headerBackground: "bg-experiment-header",
    accentBorder: "border-experiment-accent",
    accentBorderSoft: "border-experiment-accent-soft",
    accentLine: "border-experiment-accent-line",
    accentPing1: "bg-experiment-ping-1",
    accentPing2: "bg-experiment-ping-2",
    accentPing3: "bg-experiment-ping-3",
    accentText: "text-experiment-accent",
    accentTextMuted: "text-experiment-accent-muted",
    accentTextSoft: "text-experiment-accent-soft",
    accentTextStrong: "text-experiment-accent-strong",
    hoverText: "hover:text-experiment-accent",
  };
}
