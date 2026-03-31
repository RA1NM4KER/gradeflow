"use client";

import { formatPercent, getGradeBandState } from "@/lib/grade-utils";
import { Course, GradeBand } from "@/lib/types";

export function CourseMobileOverviewChart({
  bands,
  ceiling,
  currentGrade,
  guaranteedGrade,
  hasAssessments,
  hasRecordedGrade,
  isExperimenting = false,
  module,
}: {
  bands: GradeBand[];
  ceiling: number;
  currentGrade: number;
  guaranteedGrade: number;
  hasAssessments: boolean;
  hasRecordedGrade: boolean;
  isExperimenting?: boolean;
  module: Course;
}) {
  return (
    <div className="relative h-20 overflow-hidden rounded-[18px] border border-stone-200 bg-white">
      {hasAssessments ? (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 bg-[repeating-linear-gradient(135deg,rgba(229,226,220,0.8),rgba(229,226,220,0.8)_4px,rgba(247,244,238,0.92)_4px,rgba(247,244,238,0.92)_9px)]"
            style={{ width: `${getLinePosition(guaranteedGrade)}%` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 bg-[repeating-linear-gradient(135deg,rgba(229,226,220,0.8),rgba(229,226,220,0.8)_4px,rgba(247,244,238,0.92)_4px,rgba(247,244,238,0.92)_9px)]"
            style={{ width: `${100 - getLinePosition(ceiling)}%` }}
          />
        </>
      ) : null}
      <div className="absolute inset-y-0 left-[10%] border-l border-stone-300" />
      <div className="absolute inset-y-0 left-[20%] border-l border-stone-200" />
      <div className="absolute inset-y-0 left-[30%] border-l border-stone-200" />
      <div className="absolute inset-y-0 left-[40%] border-l border-stone-200" />
      <div className="absolute inset-y-0 left-[50%] border-l border-stone-300" />
      <div className="absolute inset-y-0 left-[60%] border-l border-stone-200" />
      <div className="absolute inset-y-0 left-[70%] border-l border-stone-200" />
      <div className="absolute inset-y-0 left-[80%] border-l border-stone-300" />
      <div className="absolute inset-y-0 left-[90%] border-l border-stone-200" />
      <div className="absolute inset-y-0 right-0 border-r border-stone-300" />
      <div
        className={`absolute bottom-0 left-0 top-0 border-l-2 ${
          isExperimenting ? "border-sky-600" : "border-stone-700"
        }`}
        style={{ left: `${Math.min(Math.max(currentGrade, 0), 100)}%` }}
      />
      <div
        className={`absolute top-2 -translate-x-1/2 rounded-full border bg-white px-2 py-1 text-sm font-semibold shadow-sm ${
          isExperimenting
            ? "border-sky-200 text-sky-700"
            : "border-stone-300 text-stone-700"
        }`}
        style={{ left: `${Math.min(Math.max(currentGrade, 8), 92)}%` }}
      >
        {hasRecordedGrade ? formatPercent(currentGrade) : "--"}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
        {bands.map((band) => {
          const state = getGradeBandState(module, band);

          return (
            <span
              className={`absolute inline-flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-[0.68rem] font-medium ${
                state === "unreachable"
                  ? "border-stone-300 text-stone-400"
                  : isExperimenting
                    ? "border-sky-200 text-sky-700"
                    : "border-stone-500 text-stone-700"
              }`}
              key={band.id}
              style={{
                left: `${getLinePosition(band.threshold)}%`,
                top: "50%",
              }}
            >
              {band.label}
            </span>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 h-[10px] text-[10px] text-stone-400">
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((value) => (
          <span
            className="absolute bottom-0 -translate-x-1/2"
            key={value}
            style={{
              left: `${getLinePosition(value)}%`,
            }}
          >
            {value}%
          </span>
        ))}
      </div>
    </div>
  );
}

function getLinePosition(value: number) {
  return Math.min(Math.max(value, 8), 92);
}
