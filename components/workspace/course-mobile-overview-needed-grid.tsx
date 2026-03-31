"use client";

import { Pencil } from "lucide-react";

import { GradeBandDialog } from "@/components/workspace/grade-band-dialog";
import { calculateRequiredScore, formatPercent } from "@/lib/grade-utils";
import { Course, GradeBand } from "@/lib/types";

export function CourseMobileOverviewNeededGrid({
  bands,
  module,
  onSaveBands,
}: {
  bands: GradeBand[];
  module: Course;
  onSaveBands: (bands: GradeBand[]) => void;
}) {
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
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-50 hover:text-stone-900"
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
              className="rounded-[16px] bg-white px-2 py-2.5 text-center"
              key={band.id}
            >
              <p className="text-[0.72rem] text-stone-500">{band.label}</p>
              <p className="mt-1.5 text-[0.92rem] font-semibold tracking-[-0.03em] text-stone-700">
                {needed}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
