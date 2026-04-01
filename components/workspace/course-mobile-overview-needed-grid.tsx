"use client";

import { Pencil } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { GradeBandDialog } from "@/components/workspace/grade-band-dialog";
import { getCourseTheme } from "@/lib/course-theme";
import { getExperimentTheme } from "@/lib/experiment-theme";
import {
  calculateRequiredScore,
  formatPercent,
  getGradeBandState,
} from "@/lib/grade-utils";
import { cn } from "@/lib/utils";
import { Course, GradeBand } from "@/lib/types";

export function CourseMobileOverviewNeededGrid({
  bands,
  isExperimenting = false,
  module,
  onSaveBandsAction,
}: {
  bands: GradeBand[];
  isExperimenting?: boolean;
  module: Course;
  onSaveBandsAction: (bands: GradeBand[]) => void;
}) {
  const { resolvedTheme } = useTheme();
  const theme = getCourseTheme(module, resolvedTheme);
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <div className="grid gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
          What do I need?
        </p>
        <GradeBandDialog
          bands={bands}
          onSave={onSaveBandsAction}
          triggerAsChild
          triggerChildren={
            <button
              aria-label="Edit cutoffs"
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-full border bg-surface transition hover:bg-surface-muted",
                isExperimenting
                  ? `${experimentTheme.accentBorder} ${experimentTheme.accentText}`
                  : `${theme.chartAccentBorder} ${theme.chartAccentText}`,
              )}
              type="button"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          }
        />
      </div>
      <div className="grid auto-cols-[minmax(76px,1fr)] grid-flow-col gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {bands.map((band) => {
          const result = calculateRequiredScore(module, band.threshold);
          const state = module.assessments.length
            ? getGradeBandState(module, band)
            : "unreachable";
          const needed = !module.assessments.length
            ? "Not set"
            : result.remainingWeight === 0 && !result.achievable
              ? "Closed"
              : result.achievable && result.neededAverage <= 0
                ? formatPercent(band.threshold)
                : `${result.neededAverage}%`;
          const isAttainable = state !== "unreachable";

          return (
            <div
              className={cn(
                "rounded-[16px] px-2 py-2.5 text-center",
                isAttainable ? "bg-surface" : "bg-surface",
              )}
              key={band.id}
            >
              <p
                className={cn(
                  "text-[0.72rem]",
                  !isAttainable
                    ? "text-ink-subtle"
                    : isExperimenting
                      ? experimentTheme.accentTextMuted
                      : theme.neededAccentText,
                )}
              >
                {band.label}
              </p>
              <p
                className={cn(
                  "mt-1.5 text-[0.92rem] font-semibold tracking-[-0.03em]",
                  !isAttainable
                    ? "text-foreground"
                    : isExperimenting
                      ? experimentTheme.accentText
                      : theme.neededAccentText,
                )}
              >
                {needed}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
