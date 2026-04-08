"use client";

import { Pencil } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradeBandDialog } from "@/components/workspace/grades/grade-band-dialog";
import { getCourseTheme } from "@/lib/course/course-theme";
import { getExperimentTheme } from "@/lib/grades/experiment-theme";
import {
  calculateRequiredScore,
  formatPercent,
  getCourseSubminimumRequirements,
  getGradeBandState,
} from "@/lib/grades/grade-utils";
import { cn } from "@/lib/shared/utils";
import {
  Course,
  GRADE_BAND_STATE_UNREACHABLE,
  GradeBand,
  SUBMINIMUM_STATUS_FAILED,
  SUBMINIMUM_STATUS_MET,
  SUBMINIMUM_STATUS_PENDING,
} from "@/lib/shared/types";

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
  const subminimumRequirements = getCourseSubminimumRequirements(module);

  return (
    <div className="grid gap-2.5">
      {subminimumRequirements.length > 0 ? (
        <Card className="rounded-[18px] px-3 py-3" variant="surface-subtle">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
            Subminimum rules
          </p>
          <div className="mt-2 grid gap-2">
            {subminimumRequirements.map((requirement) => (
              <div
                className="flex items-center justify-between gap-3"
                key={requirement.assessmentId}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {requirement.assessmentName}
                  </p>
                  <p className="text-xs text-ink-soft">
                    Need {formatPercent(requirement.minimumPercent)}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-xs font-semibold uppercase tracking-[0.14em]",
                    requirement.status === SUBMINIMUM_STATUS_FAILED
                      ? "text-danger"
                      : requirement.status === SUBMINIMUM_STATUS_MET
                        ? "text-success"
                        : "text-warning",
                  )}
                >
                  {requirement.status === SUBMINIMUM_STATUS_PENDING
                    ? "--"
                    : requirement.achievedPercent === null
                      ? requirement.status
                      : formatPercent(requirement.achievedPercent)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
          What do I need?
        </p>
        <GradeBandDialog
          bands={bands}
          onSave={onSaveBandsAction}
          triggerAsChild
          triggerChildren={
            <Button
              aria-label="Edit cutoffs"
              className={cn(
                "h-7 w-7 rounded-full border bg-surface p-0 transition hover:bg-surface-muted",
                isExperimenting
                  ? `${experimentTheme.accentBorder} ${experimentTheme.accentText}`
                  : `${theme.chartAccentBorder} ${theme.chartAccentText}`,
              )}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          }
        />
      </div>
      <div className="grid auto-cols-[minmax(76px,1fr)] grid-flow-col gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {bands.map((band) => {
          const result = calculateRequiredScore(module, band.threshold);
          const state = module.assessments.length
            ? getGradeBandState(module, band)
            : GRADE_BAND_STATE_UNREACHABLE;
          const needed = !module.assessments.length
            ? "Not set"
            : result.remainingWeight === 0 && !result.achievable
              ? "Closed"
              : result.achievable && result.neededAverage <= 0
                ? formatPercent(band.threshold)
                : `${result.neededAverage}%`;
          const isAttainable = state !== GRADE_BAND_STATE_UNREACHABLE;

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
              {result.subminimumRequirements.length > 0 ? (
                result.hasFailedSubminimums ? (
                  <p
                    className={cn(
                      "mt-1 text-[0.68rem] leading-tight text-danger",
                    )}
                  >
                    Submin failed
                  </p>
                ) : null
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
