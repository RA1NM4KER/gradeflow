"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

import { SemesterDialog } from "@/components/landing/semester-dialog";
import { useCourses } from "@/components/workspace/courses-provider";
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
          Gradeflow
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-[2.2rem]">
          Your semesters
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:text-[0.98rem]">
          Create a semester, add your courses, and track grades without guessing
          what you still need.
        </p>
        <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-[0.78rem] font-medium text-stone-600 shadow-card">
          <span className="h-2 w-2 rounded-full bg-[#41b3a2]" />
          Privacy-first and local-first. Your data stays on this device unless
          you export it.
        </div>
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
                "grid w-full grid-cols-[minmax(0,1fr)_auto_20px] items-start gap-2.5 rounded-[18px] px-5 py-3.5 text-left transition",
                semester.id === selectedSemester.id
                  ? "bg-white shadow-soft"
                  : "bg-[#fbfbfa] shadow-card hover:bg-white",
              )}
              onClick={() => openSemester(semester.id)}
              type="button"
            >
              <div className="min-w-0">
                <p className="text-[1.02rem] font-semibold leading-tight text-stone-950">
                  {semester.name}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {semester.periodLabel}
                </p>
              </div>
              {semester.id === selectedSemester.id ? (
                <span className="mt-0.5 inline-flex items-center gap-1 self-start rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Current
                </span>
              ) : (
                <span />
              )}
              <ArrowRight className="h-5 w-5 text-stone-400" />
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
              className="flex min-h-[82px] w-full items-center justify-center rounded-[18px] bg-[#fafaf8] px-5 py-3.5 text-stone-500 shadow-card transition hover:bg-white hover:text-stone-900"
              type="button"
            >
              <div className="flex flex-col items-center text-center">
                <Plus className="h-7 w-7" />
                <span className="mt-2 text-[0.82rem] font-semibold uppercase tracking-[0.14em]">
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
