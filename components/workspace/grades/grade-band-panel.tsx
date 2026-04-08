"use client";

import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";

import { ChartBoundMarker } from "@/components/workspace/grades/chart-bound-marker";
import { GradeBandDialog } from "@/components/workspace/grades/grade-band-dialog";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCourseTheme } from "@/lib/course/course-theme";
import { getExperimentTheme } from "@/lib/grades/experiment-theme";
import { sanitizePlainNumberInput } from "@/lib/assessments/numeric-input";
import {
  calculateRequiredScore,
  formatPercent,
  getCompletedWeight,
  getModuleCurrentGrade,
  getModuleGuaranteedGrade,
  getCourseSubminimumRequirements,
  getGradeBandState,
  getRemainingWeight,
  getSortedGradeBands,
  hasRecordedModuleGrade,
} from "@/lib/grades/grade-utils";
import { Module, GradeBand } from "@/lib/shared/types";
import { cn } from "@/lib/shared/utils";

const neutralChartStripe =
  "repeating-linear-gradient(135deg, rgb(var(--chart-stripe-rgb) / 0.62), rgb(var(--chart-stripe-rgb) / 0.62) 3px, transparent 3px, transparent 7px)";

interface GradeBandPanelProps {
  module: Module;
  isExperimenting?: boolean;
  onSaveBandsAction: (bands: GradeBand[]) => void;
  onUpdateGradeBand: (bandId: string, threshold: number) => void;
}

export function GradeBandPanel({
  module,
  isExperimenting = false,
  onSaveBandsAction,
  onUpdateGradeBand,
}: GradeBandPanelProps) {
  const hasAssessments = module.assessments.length > 0;
  const hasRecordedGrade = hasRecordedModuleGrade(module);
  const currentGrade = getModuleCurrentGrade(module);
  const animatedCurrentGrade = useAnimatedNumber(currentGrade);
  const guaranteedGrade = getModuleGuaranteedGrade(module);
  const remainingWeight = getRemainingWeight(module);
  const ceiling = guaranteedGrade + remainingWeight;
  const isLockedRange = Math.abs(ceiling - guaranteedGrade) < 0.01;
  const completion = getCompletedWeight(module);
  const bands = getSortedGradeBands(module);
  const subminimumRequirements = getCourseSubminimumRequirements(module);
  const { resolvedTheme } = useTheme();
  const theme = getCourseTheme(module, resolvedTheme);
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <div className="grid gap-3 sm:gap-4 min-[900px]:grid-cols-[280px_minmax(0,1fr)] min-[900px]:items-start">
      <div className="min-w-0">
        <div className="mb-2.5 flex items-center justify-between gap-3 sm:mb-3">
          <span className="w-7" />
          <p className="text-center text-[0.82rem] text-ink-soft sm:text-sm">
            Current standing
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
        <div className="relative h-[320px] overflow-hidden rounded-[20px] border border-line bg-surface/90 sm:h-[500px] sm:rounded-[24px]">
          {hasAssessments ? (
            <>
              <div
                className="absolute inset-x-0 top-0 transition-[height] duration-500 ease-out"
                style={{
                  backgroundImage: neutralChartStripe,
                  height: `${100 - getLinePosition(ceiling)}%`,
                }}
              />
              {isLockedRange && guaranteedGrade > 0 ? (
                <ChartBoundMarker
                  description={`Your final grade is now locked at ${formatPercent(
                    guaranteedGrade,
                  )}. There is no remaining weighted work that can move it up or down.`}
                  orientation="vertical"
                  positionPercent={getLinePosition(guaranteedGrade)}
                  title={`Locked: ${formatPercent(guaranteedGrade)}`}
                />
              ) : null}
              {!isLockedRange && ceiling < 100 ? (
                <ChartBoundMarker
                  description={`You have already lost ${formatPercent(
                    100 - ceiling,
                  )}. Even with perfect scores from here, the highest final grade you can still reach is ${formatPercent(
                    ceiling,
                  )}.`}
                  orientation="vertical"
                  positionPercent={getLinePosition(ceiling)}
                  title={`Lost: ${formatPercent(100 - ceiling)}`}
                />
              ) : null}
              <div
                className="absolute inset-x-0 bottom-0 transition-[height] duration-500 ease-out"
                style={{
                  backgroundImage: neutralChartStripe,
                  height: `${getLinePosition(guaranteedGrade)}%`,
                }}
              />
              {!isLockedRange && guaranteedGrade > 0 ? (
                <ChartBoundMarker
                  description={`You have already secured ${formatPercent(
                    guaranteedGrade,
                  )}. Even if every remaining assessment goes badly, your final grade cannot fall below ${formatPercent(
                    guaranteedGrade,
                  )}.`}
                  orientation="vertical"
                  positionPercent={getLinePosition(guaranteedGrade)}
                  title={`Guaranteed: ${formatPercent(guaranteedGrade)}`}
                />
              ) : null}
            </>
          ) : null}

          {[90, 80, 70, 60, 50, 40, 30, 20, 10].map((line) => (
            <GuideLine key={line} value={line} />
          ))}

          {hasAssessments
            ? bands.map((band) => (
                <BandLine
                  band={band}
                  isExperimenting={isExperimenting}
                  key={band.id}
                  state={getGradeBandState(module, band)}
                  theme={theme}
                />
              ))
            : null}

          {hasRecordedGrade ? (
            <CurrentLine
              isExperimenting={isExperimenting}
              theme={theme}
              value={animatedCurrentGrade}
            />
          ) : null}
          {hasRecordedGrade ? (
            <CurrentPill
              isExperimenting={isExperimenting}
              theme={theme}
              value={animatedCurrentGrade}
            />
          ) : null}

          <p className="absolute inset-x-0 bottom-3 text-center text-[0.8rem] text-ink-soft sm:bottom-4 sm:text-sm">
            {hasRecordedGrade
              ? `${formatPercent(completion)} complete`
              : hasAssessments
                ? "Waiting for first grade"
                : "Add assignments to start tracking"}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        {subminimumRequirements.length > 0 ? (
          <Card
            className="mb-3 overflow-hidden rounded-[20px] bg-surface/90 sm:mb-4 sm:rounded-[24px]"
            variant="surface-subtle"
          >
            <div className="border-b border-line px-3 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-subtle sm:px-4">
              Subminimum rules
            </div>
            <div className="grid gap-0">
              {subminimumRequirements.map((requirement) => (
                <div
                  className="flex items-center justify-between gap-3 border-t border-line px-3 py-2.5 first:border-t-0 sm:px-4 sm:py-3"
                  key={requirement.assessmentId}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {requirement.assessmentName}
                    </p>
                    <p className="text-xs text-ink-soft">
                      Need at least {formatPercent(requirement.minimumPercent)}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 text-xs font-semibold uppercase tracking-[0.14em]",
                      requirement.status === "failed"
                        ? "text-danger"
                        : requirement.status === "met"
                          ? "text-success"
                          : "text-warning",
                    )}
                  >
                    {requirement.status === "failed"
                      ? requirement.achievedPercent === null
                        ? "Failed"
                        : `${formatPercent(requirement.achievedPercent)}`
                      : requirement.status === "met"
                        ? requirement.achievedPercent === null
                          ? "Met"
                          : `${formatPercent(requirement.achievedPercent)}`
                        : "--"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <p className="mb-2.5 text-center text-[0.82rem] text-ink-soft sm:mb-3 sm:text-sm">
          Remainder of grades must average:
        </p>
        <Card
          className="overflow-hidden rounded-[20px] bg-surface/90 sm:rounded-[24px]"
          variant="surface-subtle"
        >
          {bands.map((band) => {
            const result = calculateRequiredScore(module, band.threshold);
            const state = hasAssessments
              ? getGradeBandState(module, band)
              : "reachable";
            const needed = !hasAssessments
              ? "Not set"
              : state === "guaranteed"
                ? formatPercent(band.threshold)
                : result.remainingWeight === 0
                  ? "Closed"
                  : `${result.neededAverage}%`;

            return (
              <div
                className={cn(
                  "grid gap-1.5 border-t border-line px-3 py-2.5 first:border-t-0 sm:px-4 sm:py-3",
                  state === "unreachable"
                    ? "text-ink-subtle"
                    : isExperimenting
                      ? experimentTheme.accentText
                      : theme.neededAccentText,
                )}
                key={band.id}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="text-[1.35rem] font-semibold leading-none tracking-tight sm:text-[1.7rem]">
                      {renderNeededValue(needed)}
                    </p>
                    <p className="text-[0.88rem] leading-none sm:text-base">
                      <span className="font-medium text-ink-soft">for a </span>
                      <span
                        className={cn(
                          "font-semibold",
                          state === "unreachable"
                            ? "text-ink-subtle"
                            : isExperimenting
                              ? experimentTheme.accentText
                              : theme.neededAccentText,
                        )}
                      >
                        {band.label}
                      </span>
                    </p>
                  </div>
                  <InlineBandThreshold
                    band={band}
                    onCommit={(threshold) =>
                      onUpdateGradeBand(band.id, threshold)
                    }
                  />
                </div>
                {result.subminimumRequirements.length > 0 ? (
                  <p
                    className={cn(
                      "text-xs",
                      result.hasFailedSubminimums
                        ? "text-danger"
                        : "text-ink-soft",
                    )}
                  >
                    {result.hasFailedSubminimums
                      ? `Blocked by ${getSubminimumSummary(result)}`
                      : result.hasPendingSubminimums
                        ? `Meet submin: ${getSubminimumSummary(result)}`
                        : "Submin met"}
                  </p>
                ) : null}
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function renderNeededValue(value: string) {
  if (!value.endsWith("%")) {
    return value;
  }

  return (
    <>
      {value.slice(0, -1)}
      <span className="text-base font-medium text-ink-soft">%</span>
    </>
  );
}

function getSubminimumSummary(
  result: ReturnType<typeof calculateRequiredScore>,
) {
  return result.subminimumRequirements
    .filter((requirement) =>
      result.hasFailedSubminimums
        ? requirement.status === "failed"
        : requirement.status === "pending",
    )
    .map(
      (requirement) =>
        `${requirement.assessmentName} >= ${formatPercent(
          requirement.minimumPercent,
        )}`,
    )
    .join(" · ");
}

function getLinePosition(value: number) {
  return Math.min(Math.max(value, 8), 92);
}

function GuideLine({ value }: { value: number }) {
  return (
    <div
      className="absolute inset-x-0 border-t border-line transition-[bottom] duration-500 ease-out"
      style={{ bottom: `${getLinePosition(value)}%` }}
    >
      <span className="absolute right-4 top-0 -translate-y-1/2 text-[11px] text-ink-subtle">
        {value}%
      </span>
    </div>
  );
}

function BandLine({
  band,
  isExperimenting = false,
  state,
  theme,
}: {
  band: GradeBand;
  isExperimenting?: boolean;
  state: "guaranteed" | "reachable" | "unreachable";
  theme: ReturnType<typeof getCourseTheme>;
}) {
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <div
      className="absolute inset-x-0 transition-[bottom] duration-500 ease-out"
      style={{ bottom: `${getLinePosition(band.threshold)}%` }}
    >
      <div
        className={cn(
          "border-t transition-colors duration-300",
          isExperimenting
            ? state === "unreachable"
              ? `${experimentTheme.accentBorder} opacity-60`
              : experimentTheme.accentLine
            : state === "unreachable"
              ? `${theme.chartAccentLine} opacity-60`
              : theme.chartAccentLine,
        )}
      />
      <div className="absolute inset-x-0 top-0 -translate-y-1/2 px-4">
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full border bg-surface text-sm transition-colors duration-300",
            isExperimenting
              ? `${experimentTheme.accentBorder} bg-surface ${experimentTheme.accentText}`
              : `${theme.chartAccentBorder} ${theme.chartAccentText}`,
            state === "unreachable" && "opacity-60",
          )}
        >
          {band.label}
        </span>
      </div>
    </div>
  );
}

function CurrentLine({
  value,
  isExperimenting = false,
  theme,
}: {
  value: number;
  isExperimenting?: boolean;
  theme: ReturnType<typeof getCourseTheme>;
}) {
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <div
      className={cn(
        "absolute inset-x-0 border-t-2 transition-[bottom] duration-500 ease-out",
        isExperimenting ? experimentTheme.accentLine : theme.chartAccentLine,
      )}
      style={{ bottom: `${getLinePosition(value)}%` }}
    />
  );
}

function CurrentPill({
  value,
  isExperimenting = false,
  theme,
}: {
  value: number;
  isExperimenting?: boolean;
  theme: ReturnType<typeof getCourseTheme>;
}) {
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 transition-[bottom] duration-500 ease-out"
      style={{ bottom: `calc(${getLinePosition(value)}% - 20px)` }}
    >
      <div
        className={cn(
          "rounded-full border bg-surface px-6 py-2 shadow-sm transition-shadow duration-300",
          isExperimenting
            ? `${experimentTheme.accentBorder} bg-surface`
            : theme.chartAccentBorder,
        )}
      >
        <p
          className={cn(
            "text-[1.75rem] font-semibold leading-none tracking-tight",
            isExperimenting
              ? experimentTheme.accentText
              : theme.chartAccentText,
          )}
        >
          {formatPercent(value)}
        </p>
      </div>
    </div>
  );
}

function InlineBandThreshold({
  band,
  onCommit,
}: {
  band: GradeBand;
  onCommit: (threshold: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(band.threshold));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(String(band.threshold));
  }, [band.threshold]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      requestAnimationFrame(() => {
        const input = inputRef.current;
        if (!input) return;
        const position = input.value.length;
        input.setSelectionRange(position, position);
      });
    }
  }, [editing]);

  if (!editing) {
    return (
      <button
        className="cursor-text text-sm font-medium leading-none text-ink-subtle"
        onClick={() => setEditing(true)}
        type="button"
      >
        cutoff {band.threshold}%
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 text-sm font-medium leading-none text-ink-subtle">
      <Input
        className="w-10 text-right text-sm"
        onBlur={() => {
          setEditing(false);
          onCommit(Math.max(Math.min(Number(draft || 0), 100), 0));
        }}
        onChange={(event) =>
          setDraft(sanitizePlainNumberInput(event.target.value))
        }
        onKeyDown={(event) =>
          handleInlineNumberKeyDown(
            event,
            inputRef,
            setEditing,
            setDraft,
            band.threshold,
          )
        }
        ref={inputRef}
        inputMode="decimal"
        type="text"
        variant="inline-number"
        value={draft}
      />
      <span className="text-ink-soft">%</span>
    </div>
  );
}

function handleInlineNumberKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  inputRef: React.RefObject<HTMLInputElement | null>,
  setEditing: (value: boolean) => void,
  setDraft: (value: string) => void,
  value: number,
) {
  if (event.key === "Enter") {
    inputRef.current?.blur();
  }

  if (event.key === "Escape") {
    setDraft(String(value));
    setEditing(false);
  }
}

function useAnimatedNumber(target: number, duration = 450) {
  const [animated, setAnimated] = useState(target);
  const frameRef = useRef<number | null>(null);
  const previousTargetRef = useRef(target);

  useEffect(() => {
    const startValue = previousTargetRef.current;
    const delta = target - startValue;

    if (Math.abs(delta) < 0.05) {
      setAnimated(target);
      previousTargetRef.current = target;
      return;
    }

    const start = performance.now();

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + delta * eased;

      setAnimated(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      previousTargetRef.current = target;
      frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, target]);

  return animated;
}
