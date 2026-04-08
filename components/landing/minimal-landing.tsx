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
    <PageContainer className="flex min-h-[calc(100vh-5.5rem)] flex-col pt-12">
      <PageIntro
        badge="GradeLog"
        description="Keep track of your marks and know exactly where you stand."
        maxWidthClassName="max-w-2xl"
        title="Your semesters"
      >
        <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[0.78rem] font-medium text-ink-soft shadow-card">
          <span className="bg-course-teal h-2 w-2 rounded-full" />
          Private. No sign up. Works offline.
        </div>
      </PageIntro>

      {suggestions.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.name}
              onClick={() =>
                createSuggestedSemester(suggestion.name, suggestion.periodLabel)
              }
              size="sm"
              type="button"
              variant="secondary"
            >
              + {suggestion.name}
            </Button>
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
                <span className="mt-0.5 inline-flex items-center gap-1 self-start rounded-full border border-success-soft bg-success-soft px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-success">
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
            <Button
              className="min-h-[82px] w-full rounded-[18px] px-5 py-3.5 text-ink-muted hover:text-foreground"
              size={null}
              type="button"
              variant="secondary"
            >
              <div className="flex flex-col items-center text-center">
                <Plus className="h-7 w-7" />
                <span className="mt-2 text-[0.82rem] font-semibold uppercase tracking-[0.14em]">
                  Create semester
                </span>
              </div>
            </Button>
          }
        />
      </div>

      <div className="mt-auto pt-6 sm:pt-8">
        <Card className="rounded-[22px] p-0" variant="glass-panel">
          <CardContent className="p-5 sm:px-6 sm:py-5">
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
                    GradeLog stays free, local-first, and account-free. If it
                    has been useful to you, you can help support development.
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

              <Button
                asChild
                className="self-start sm:self-center"
                size="pill"
                variant="glass"
              >
                <a
                  href="https://ko-fi.com/kefasaleck"
                  rel="noreferrer"
                  target="_blank"
                >
                  Support on Ko-fi
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
