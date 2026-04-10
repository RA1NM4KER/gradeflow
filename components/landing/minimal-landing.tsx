"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  HeartHandshake,
  Plus,
  Trash2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { PageIntro } from "@/components/ui/page-intro";
import { SemesterDialog } from "@/components/landing/semester-dialog";
import { useCourses } from "@/components/workspace/shared/courses-provider";
import {
  createSemester,
  getSuggestedSemesters,
} from "@/lib/course/semester-utils";
import { cn } from "@/lib/shared/utils";

export function MinimalLanding() {
  const router = useRouter();
  const {
    addSemester,
    deleteSemester,
    semester: selectedSemester,
    semesters,
    selectSemester,
  } = useCourses();
  const [suggestionNames, setSuggestionNames] = useState<string[]>([]);

  const existingNames = new Set(semesters.map((semester) => semester.name));
  const suggestions = getSuggestedSemesters().filter(
    (suggestion) =>
      suggestionNames.includes(suggestion.name) &&
      !existingNames.has(suggestion.name),
  );

  useEffect(() => {
    setSuggestionNames(
      getSuggestedSemesters().map((suggestion) => suggestion.name),
    );
  }, []);

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

  function getSuggestionPillLabel(name: string) {
    return name.replace(/^Semester /, "Sem ");
  }

  return (
    <PageContainer className="flex min-h-[calc(100vh-5.5rem)] flex-col pt-7 pb-0 sm:pt-12 sm:pb-10">
      <PageIntro
        badge="GradeLog"
        descriptionClassName="sm:text-[1.08rem] sm:leading-7"
        description="Keep track of your marks and know exactly where you stand."
        maxWidthClassName="max-w-2xl"
        title="Your semesters"
      >
        <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-line/80 bg-surface-soft px-3 py-1.5 text-[0.74rem] font-medium text-ink-soft shadow-none sm:mt-4 sm:bg-surface sm:px-3.5 sm:py-2 sm:text-[0.78rem] sm:shadow-card">
          <span className="bg-course-teal h-2 w-2 rounded-full" />
          Private. No sign up. Works offline.
        </div>
      </PageIntro>

      {suggestions.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:flex sm:flex-wrap">
          {suggestions.map((suggestion) => (
            <Button
              className="min-w-0 bg-surface-soft px-2 text-[0.7rem] text-ink-soft shadow-card hover:bg-surface hover:text-foreground sm:px-3 sm:text-xs"
              key={suggestion.name}
              onClick={() =>
                createSuggestedSemester(suggestion.name, suggestion.periodLabel)
              }
              size="sm"
              type="button"
              variant="secondary"
            >
              <span className="truncate">
                + {getSuggestionPillLabel(suggestion.name)}
              </span>
            </Button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-2.5 sm:mt-8 sm:gap-3">
        {semesters.map((semester) => (
          <div className="flex items-center gap-2.5 sm:gap-3" key={semester.id}>
            <button
              className={cn(
                "grid w-full grid-cols-[minmax(0,1fr)_auto_18px] items-center gap-2 rounded-[16px] px-4 py-3 text-left transition sm:grid-cols-[minmax(0,1fr)_auto_20px] sm:items-start sm:gap-2.5 sm:rounded-[18px] sm:px-5 sm:py-3.5",
                semester.id === selectedSemester.id
                  ? "bg-surface shadow-soft"
                  : "bg-surface-soft shadow-card hover:bg-surface",
              )}
              onClick={() => openSemester(semester.id)}
              type="button"
            >
              <div className="min-w-0">
                <p className="text-[1rem] font-semibold leading-tight text-foreground sm:text-[1.02rem]">
                  {semester.name}
                </p>
                <p className="mt-1 text-[0.92rem] text-ink-muted sm:text-sm">
                  {semester.periodLabel}
                </p>
              </div>
              {semester.id === selectedSemester.id ? (
                <span className="inline-flex items-center gap-1 self-start rounded-full border border-success-soft bg-success-soft px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-success sm:mt-0.5 sm:text-[0.58rem]">
                  <span className="h-1.5 w-1.5 rounded-full bg-success-solid" />
                  Current
                </span>
              ) : (
                <span />
              )}
              <ArrowRight className="h-5 w-5 text-ink-subtle" />
            </button>
            <button
              aria-label={`Delete ${semester.name}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-soft text-ink-subtle shadow-card transition hover:bg-surface hover:text-ink-strong sm:h-11 sm:w-11"
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
            <Button
              className="min-h-[64px] w-full rounded-[16px] bg-surface-soft px-4 py-3 text-ink-muted shadow-card hover:bg-surface hover:text-foreground sm:min-h-[82px] sm:rounded-[18px] sm:px-5 sm:py-3.5"
              size={null}
              type="button"
              variant="secondary"
            >
              <div className="flex flex-col items-center text-center">
                <Plus className="h-5 w-5 sm:h-7 sm:w-7" />
                <span className="mt-1 text-[0.74rem] font-semibold uppercase tracking-[0.14em] sm:mt-2 sm:text-[0.82rem]">
                  Create semester
                </span>
              </div>
            </Button>
          }
        />
      </div>

      <div className="mt-auto pt-7 sm:pt-8">
        <Card
          className="rounded-[18px] border border-line/80 p-0 shadow-none sm:rounded-[22px] sm:border-white/24 sm:shadow-card dark:sm:border-white/10"
          variant="glass-panel"
        >
          <CardContent className="p-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/22 bg-white/50 text-foreground shadow-none backdrop-blur-sm dark:border-white/10 dark:bg-white/10 sm:h-11 sm:w-11 sm:border-white/28 sm:bg-white/58 sm:shadow-[0_8px_24px_-18px_rgba(15,23,42,0.2)]">
                    <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <p className="min-w-0 text-[0.96rem] font-semibold text-foreground sm:text-[0.98rem]">
                    Keep GradeLog independent
                  </p>
                </div>
                <div className="mt-2.5 sm:mt-1 sm:ml-14 ">
                  <p className="max-w-xl text-[0.88rem] leading-6 text-ink-soft sm:max-w-2xl sm:text-sm sm:leading-6">
                    GradeLog stays free, local-first, and account-free. If it
                    has been useful to you, you can help support development.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <Link
                      className="text-[0.92rem] font-medium text-foreground/88 underline decoration-foreground/35 underline-offset-4 transition hover:text-foreground hover:decoration-foreground sm:text-sm"
                      href="/privacy"
                      prefetch={false}
                    >
                      <span className="sm:hidden">Privacy</span>
                      <span className="hidden sm:inline">Privacy policy</span>
                    </Link>
                    <Link
                      className="text-[0.92rem] font-medium text-foreground/88 underline decoration-foreground/35 underline-offset-4 transition hover:text-foreground hover:decoration-foreground sm:text-sm"
                      href="/terms"
                      prefetch={false}
                    >
                      <span className="sm:hidden">Terms</span>
                      <span className="hidden sm:inline">Terms of service</span>
                    </Link>
                  </div>
                </div>
              </div>

              <Button
                asChild
                className="w-full sm:w-auto sm:self-center sm:rounded-full sm:border-white/28 sm:bg-white/62 sm:px-4 sm:py-2 sm:text-sm sm:font-medium sm:backdrop-blur-sm sm:hover:bg-white/82"
                size="sm"
                variant="outline"
              >
                <a
                  href="https://ko-fi.com/kefasaleck"
                  rel="noreferrer"
                  target="_blank"
                >
                  Support on Ko-fi
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
