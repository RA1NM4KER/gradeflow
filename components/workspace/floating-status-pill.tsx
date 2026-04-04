"use client";

import { ReactNode } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { getExperimentTheme } from "@/lib/experiment-theme";
import { ResolvedTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type FloatingStatusPillTone = "experiment" | "danger";

function getDangerTheme(mode: ResolvedTheme) {
  if (mode === "dark") {
    return {
      wrapper: "border-rose-300/40 bg-rose-300/10",
      iconShell: "border-rose-300/28 bg-rose-300/12",
      action: "border-rose-300/26 bg-rose-300/10 hover:bg-rose-300/14",
      textStrong: "text-rose-100",
      text: "text-rose-200",
      textMuted: "text-rose-100/72",
    };
  }

  return {
    wrapper: "border-rose-200 bg-rose-50",
    iconShell: "border-rose-200 bg-white/72",
    action: "border-rose-200 bg-white/68 hover:bg-white/82",
    textStrong: "text-rose-900",
    text: "text-rose-700",
    textMuted: "text-rose-700/76",
  };
}

export function FloatingStatusPill({
  actionIcon,
  actionLabel,
  icon,
  onAction,
  subtitle,
  title,
  tone,
}: {
  actionIcon?: ReactNode;
  actionLabel?: string;
  icon: ReactNode;
  onAction?: () => void;
  subtitle: string;
  title: string;
  tone: FloatingStatusPillTone;
}) {
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);
  const dangerTheme = getDangerTheme(resolvedTheme);
  const toneTheme =
    tone === "experiment"
      ? {
          wrapper:
            "border-white/30 bg-white/48 dark:border-white/10 dark:bg-white/10",
          iconShell:
            "border-white/30 bg-white/62 dark:border-white/10 dark:bg-white/12",
          action:
            "border-white/28 bg-white/60 hover:bg-white/78 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14",
          textStrong: experimentTheme.accentTextStrong,
          text: experimentTheme.accentText,
          textMuted: experimentTheme.accentTextMuted,
        }
      : dangerTheme;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-2 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.28),0_1px_0_rgba(255,255,255,0.45)_inset] backdrop-blur-xl",
        toneTheme.wrapper,
        toneTheme.textStrong,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={cn(
            "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border backdrop-blur-sm sm:h-8 sm:w-8",
            toneTheme.iconShell,
            toneTheme.text,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[0.82rem] font-semibold sm:text-sm">{title}</p>
          <p
            className={cn(
              "text-[0.68rem] sm:text-[0.72rem]",
              toneTheme.textMuted,
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {onAction && actionLabel ? (
        <Button
          className={cn(
            "h-8 shrink-0 rounded-full border px-3 text-[0.75rem] backdrop-blur-sm sm:h-9 sm:px-3.5 sm:text-[0.82rem]",
            toneTheme.action,
            toneTheme.textStrong,
          )}
          onClick={onAction}
          size="sm"
          type="button"
          variant="secondary"
        >
          {actionIcon}
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
