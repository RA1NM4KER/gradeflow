"use client";

import { Pencil } from "lucide-react";

import { GradeBandDialog } from "@/components/workspace/grade-band-dialog";
import { getCourseTheme } from "@/lib/course-theme";
import { calculateRequiredScore, formatPercent } from "@/lib/grade-utils";
import { cn } from "@/lib/utils";
import { Course, GradeBand } from "@/lib/types";

export function CourseMobileOverviewNeededGrid({
  bands,
  isExperimenting = false,
  module,
  onSaveBands,
}: {
  bands: GradeBand[];
  isExperimenting?: boolean;
  module: Course;
  onSaveBands: (bands: GradeBand[]) => void;
}) {
  const theme = getCourseTheme(module);

  return (
    <div className="grid gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
          What do I need?
        </p>
        <GradeBandDialog
          bands={bands}
          onSave={onSaveBands}
          triggerAsChild
          triggerChildren={
            <button
              aria-label="Edit cutoffs"
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-full border bg-white transition hover:bg-stone-50",
                isExperimenting
                  ? "border-violet-200 text-violet-700"
                  : `${theme.markerBorder} ${theme.markerText}`,
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
          const needed = !module.assessments.length
            ? "Not set"
            : result.remainingWeight === 0 && !result.achievable
              ? "Closed"
              : result.achievable && result.neededAverage <= 0
                ? formatPercent(band.threshold)
                : `${result.neededAverage}%`;

          return (
            <div
              className={cn(
                "rounded-[16px] px-2 py-2.5 text-center",
                "bg-white",
              )}
              key={band.id}
            >
              <p
                className={cn(
                  "text-[0.72rem]",
                  isExperimenting ? "text-violet-500" : theme.neededMuted,
                )}
              >
                {band.label}
              </p>
              <p
                className={cn(
                  "mt-1.5 text-[0.92rem] font-semibold tracking-[-0.03em]",
                  isExperimenting ? "text-violet-700" : theme.neededText,
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
