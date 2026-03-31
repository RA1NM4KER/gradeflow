"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

import { SemesterDialog } from "@/components/landing/semester-dialog";
import { useCourses } from "@/components/workspace/workspace-provider";
import { createSemester, getSuggestedSemesters } from "@/lib/semester-utils";
import { cn } from "@/lib/utils";

export function MinimalLanding() {
  const router = useRouter();
  const {
    addSemester,
    deleteSemester,
    semester: selectedSemester,
    semesters,
    selectSemester,
  } = useCourses();

  const existingNames = new Set(semesters.map((semester) => semester.name));
  const suggestions = getSuggestedSemesters().filter(
    (suggestion) => !existingNames.has(suggestion.name),
  );

  function openSemester(semesterId: string) {
    selectSemester(semesterId);
    router.push(`/courses?semester=${semesterId}`);
  }

  function createSuggestedSemester(name: string, periodLabel: string) {
    const semester = createSemester({
      name,
      periodLabel,
    });
    addSemester(semester);
    router.push(`/courses?semester=${semester.id}`);
  }

  function removeSemester(semesterId: string, semesterName: string) {
    const confirmed = window.confirm(
      `Delete "${semesterName}"? This will remove its courses and assignments from your local state.`,
    );

    if (!confirmed) {
      return;
    }

    deleteSemester(semesterId);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-12 sm:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          Semesters
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-stone-950">
          Your semesters
        </h1>
      </div>

      {suggestions.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              className="rounded-xl bg-[#fbfbfa] px-4 py-2 text-sm font-medium text-stone-700 shadow-card transition hover:bg-white"
              key={suggestion.name}
              onClick={() =>
                createSuggestedSemester(suggestion.name, suggestion.periodLabel)
              }
              type="button"
            >
              + {suggestion.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid gap-3">
        {semesters.map((semester) => (
          <div className="flex items-center gap-3" key={semester.id}>
            <button
              className={cn(
                "flex w-full items-center justify-between rounded-[18px] px-5 py-4 text-left transition",
                semester.id === selectedSemester.id
                  ? "bg-white shadow-soft"
                  : "bg-[#fbfbfa] shadow-card hover:bg-white",
              )}
              onClick={() => openSemester(semester.id)}
              type="button"
            >
              <div className="min-w-0">
                <p className="text-lg font-semibold text-stone-950">
                  {semester.name}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {semester.periodLabel}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                {semester.id === selectedSemester.id ? (
                  <span className="rounded-lg bg-stone-950 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-stone-50">
                    Current
                  </span>
                ) : null}
                <ArrowRight className="h-5 w-5 text-stone-400" />
              </div>
            </button>
            <button
              aria-label={`Delete ${semester.name}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fbfbfa] text-stone-400 shadow-card transition hover:bg-white hover:text-stone-700"
              onClick={() => removeSemester(semester.id, semester.name)}
              type="button"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        ))}
        <SemesterDialog
          onSaveSemester={addSemester}
          triggerAsChild
          triggerChildren={
            <button
              className="flex min-h-[108px] w-full items-center justify-center rounded-[18px] bg-[#fafaf8] px-5 py-4 text-stone-500 shadow-card transition hover:bg-white hover:text-stone-900"
              type="button"
            >
              <div className="flex flex-col items-center text-center">
                <Plus className="h-8 w-8" />
                <span className="mt-3 text-sm font-semibold uppercase tracking-[0.14em]">
                  Create semester
                </span>
              </div>
            </button>
          }
        />
      </div>
    </div>
  );
}
