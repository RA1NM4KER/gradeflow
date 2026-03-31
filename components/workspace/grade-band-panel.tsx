"use client";

import React, { KeyboardEvent, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { getCourseTheme } from "@/lib/course-theme";
import { sanitizePlainNumberInput } from "@/lib/numeric-input";
import {
  calculateRequiredScore,
  formatPercent,
  getCompletedWeight,
  getModuleCurrentGrade,
  getModuleGuaranteedGrade,
  getGradeBandState,
  getRemainingWeight,
  getSortedGradeBands,
  hasRecordedModuleGrade,
} from "@/lib/grade-utils";
import { Module, GradeBand } from "@/lib/types";
import { cn } from "@/lib/utils";

const inlineInputClassName =
  "h-auto rounded-none border-0 bg-transparent px-0 py-0 text-inherit shadow-none focus-visible:ring-0";
const neutralChartStripe =
  "repeating-linear-gradient(135deg, rgba(214,211,209,0.62), rgba(214,211,209,0.62) 3px, transparent 3px, transparent 7px)";

interface GradeBandPanelProps {
  module: Module;
  isExperimenting?: boolean;
  onUpdateGradeBand: (bandId: string, threshold: number) => void;
}

export function GradeBandPanel({
  module,
  isExperimenting = false,
  onUpdateGradeBand,
}: GradeBandPanelProps) {
  const hasAssessments = module.assessments.length > 0;
  const hasRecordedGrade = hasRecordedModuleGrade(module);
  const currentGrade = getModuleCurrentGrade(module);
  const animatedCurrentGrade = useAnimatedNumber(currentGrade);
  const guaranteedGrade = getModuleGuaranteedGrade(module);
  const remainingWeight = getRemainingWeight(module);
  const ceiling = guaranteedGrade + remainingWeight;
  const completion = getCompletedWeight(module);
  const bands = getSortedGradeBands(module);
  const theme = getCourseTheme(module);

  return (
    <div className="grid gap-3 sm:gap-4 min-[900px]:grid-cols-[280px_minmax(0,1fr)] min-[900px]:items-start">
      <div className="min-w-0">
        <p className="mb-2.5 text-center text-[0.82rem] text-stone-500 sm:mb-3 sm:text-sm">
          Current standing
        </p>
        <div className="relative h-[320px] overflow-hidden rounded-[20px] border border-stone-200 bg-white/90 sm:h-[500px] sm:rounded-[24px]">
          {hasAssessments ? (
            <>
              <div
                className="absolute inset-x-0 top-0 transition-[height] duration-500 ease-out"
                style={{
                  backgroundImage: neutralChartStripe,
                  height: `${100 - getLinePosition(ceiling)}%`,
                }}
              />
              <div
                className="absolute inset-x-0 bottom-0 transition-[height] duration-500 ease-out"
                style={{
                  backgroundImage: neutralChartStripe,
                  height: `${getLinePosition(guaranteedGrade)}%`,
                }}
              />
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

          <p className="absolute inset-x-0 bottom-3 text-center text-[0.8rem] text-stone-600 sm:bottom-4 sm:text-sm">
            {hasRecordedGrade
              ? `${formatPercent(completion)} complete`
              : hasAssessments
                ? "Waiting for first grade"
                : "Add assignments to start tracking"}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-2.5 text-center text-[0.82rem] text-stone-500 sm:mb-3 sm:text-sm">
          Remainder of grades must average:
        </p>
        <div className="overflow-hidden rounded-[20px] border border-stone-200 bg-white/90 sm:rounded-[24px]">
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
                  "grid gap-1.5 border-t border-stone-200 px-3 py-2.5 first:border-t-0 sm:px-4 sm:py-3",
                  state === "unreachable"
                    ? "text-stone-400"
                    : isExperimenting
                      ? "text-violet-700"
                      : theme.neededText,
                )}
                key={band.id}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="text-[1.35rem] font-semibold leading-none tracking-tight sm:text-[1.7rem]">
                      {renderNeededValue(needed)}
                    </p>
                    <p className="text-[0.88rem] leading-none sm:text-base">
                      <span className="font-medium text-stone-500">for a </span>
                      <span
                        className={cn(
                          "font-semibold",
                          state === "unreachable"
                            ? "text-stone-400"
                            : isExperimenting
                              ? "text-violet-700"
                              : theme.neededText,
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
              </div>
            );
          })}
        </div>
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
      <span className="text-base font-medium text-stone-500">%</span>
    </>
  );
}

function getLinePosition(value: number) {
  return Math.min(Math.max(value, 8), 92);
}

function GuideLine({ value }: { value: number }) {
  return (
    <div
      className="absolute inset-x-0 border-t border-stone-200 transition-[bottom] duration-500 ease-out"
      style={{ bottom: `${getLinePosition(value)}%` }}
    >
      <span className="absolute right-4 top-0 -translate-y-1/2 text-[11px] text-stone-400">
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
              ? "border-violet-200 opacity-60"
              : "border-violet-600"
            : state === "unreachable"
              ? `${theme.markerLine} opacity-60`
              : theme.markerLine,
        )}
      />
      <div className="absolute inset-x-0 top-0 -translate-y-1/2 px-4">
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full border bg-white text-sm transition-colors duration-300",
            isExperimenting
              ? "border-violet-200 text-violet-700"
              : `${theme.markerBorder} ${theme.markerText}`,
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
  return (
    <div
      className={cn(
        "absolute inset-x-0 border-t-2 transition-[bottom] duration-500 ease-out",
        isExperimenting ? "border-violet-600" : theme.markerLine,
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
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 transition-[bottom] duration-500 ease-out"
      style={{ bottom: `calc(${getLinePosition(value)}% - 20px)` }}
    >
      <div
        className={cn(
          "rounded-full border bg-white px-6 py-2 shadow-sm transition-shadow duration-300",
          isExperimenting ? "border-violet-200" : theme.markerBorder,
        )}
      >
        <p
          className={cn(
            "text-[1.75rem] font-semibold leading-none tracking-tight",
            isExperimenting ? "text-violet-700" : theme.markerText,
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
        className="cursor-text text-sm font-medium leading-none text-stone-400"
        onClick={() => setEditing(true)}
        type="button"
      >
        cutoff {band.threshold}%
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 text-sm font-medium leading-none text-stone-400">
      <Input
        className={`${inlineInputClassName} w-10 text-right text-sm`}
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
        value={draft}
      />
      <span className="text-stone-500">%</span>
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
