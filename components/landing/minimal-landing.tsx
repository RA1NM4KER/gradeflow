"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ExternalLink,
  HeartHandshake,
  Plus,
  Trash2,
} from "lucide-react";

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
    <div className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-5xl flex-col px-5 pt-12 sm:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          GradeLog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2.2rem]">
          Your semesters
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft sm:text-[0.98rem]">
          Keep track of your marks and know exactly where you stand.
        </p>
        <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[0.78rem] font-medium text-ink-soft shadow-card">
          <span className="h-2 w-2 rounded-full bg-[#41b3a2]" />
          Private. No sign up. Works offline.
        </div>
      </div>

      {suggestions.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              className="rounded-xl bg-surface-soft px-4 py-2 text-sm font-medium text-ink-strong shadow-card transition hover:bg-surface"
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
                  ? "bg-surface shadow-soft"
                  : "bg-surface-soft shadow-card hover:bg-surface",
              )}
              onClick={() => openSemester(semester.id)}
              type="button"
            >
              <div className="min-w-0">
                <p className="text-[1.02rem] font-semibold leading-tight text-foreground">
                  {semester.name}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
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
              <ArrowRight className="h-5 w-5 text-ink-subtle" />
            </button>
            <button
              aria-label={`Delete ${semester.name}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-soft text-ink-subtle shadow-card transition hover:bg-surface hover:text-ink-strong"
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
              className="flex min-h-[82px] w-full items-center justify-center rounded-[18px] bg-surface-sheet px-5 py-3.5 text-ink-muted shadow-card transition hover:bg-surface hover:text-foreground"
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

      <div className="mt-auto pt-6 sm:pt-8">
        <div className="rounded-[22px] border border-white/24 bg-white/42 p-5 shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-white/6 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/28 bg-white/58 text-foreground shadow-[0_8px_24px_-18px_rgba(15,23,42,0.2)] backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground sm:text-[0.98rem]">
                  Keep GradeLog independent
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
                  GradeLog stays free, local-first, and account-free. If it has
                  been useful to you, you can help support development.
                </p>
                <div className="mt-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <Link
                      className="text-sm text-ink-muted underline decoration-line underline-offset-4 transition hover:text-foreground"
                      href="/privacy"
                      prefetch={false}
                    >
                      Privacy policy
                    </Link>
                    <Link
                      className="text-sm text-ink-muted underline decoration-line underline-offset-4 transition hover:text-foreground"
                      href="/terms"
                      prefetch={false}
                    >
                      Terms of service
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <a
              className="inline-flex items-center justify-center gap-1 self-start rounded-full border border-white/28 bg-white/62 px-4 py-2 text-sm font-medium text-foreground shadow-[0_10px_24px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm transition hover:bg-white/82 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14 sm:self-center"
              href="https://ko-fi.com/kefasaleck"
              rel="noreferrer"
              target="_blank"
            >
              Support on Ko-fi
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
