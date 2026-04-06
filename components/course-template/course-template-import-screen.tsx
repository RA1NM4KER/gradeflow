"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, LoaderCircle, Share2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/ui/page-intro";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SectionLabel } from "@/components/ui/section-label";
import { useCourses } from "@/components/workspace/courses-provider";
import {
  fetchCourseTemplateByToken,
  instantiateCourseFromTemplate,
  CourseTemplateRecord,
} from "@/lib/course-template";

export function CourseTemplateImportScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("t")?.trim() ?? "";
  const { addCourseToSemester, selectedSemesterId, semesters } = useCourses();
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [templateRecord, setTemplateRecord] =
    useState<CourseTemplateRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [targetSemesterId, setTargetSemesterId] = useState(
    selectedSemesterId || semesters[0]?.id || "",
  );

  useEffect(() => {
    if (!targetSemesterId && semesters[0]?.id) {
      setTargetSemesterId(semesters[0].id);
    }
  }, [semesters, targetSemesterId]);

  useEffect(() => {
    if (!token) {
      setErrorMessage("This course template link is missing its token.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTemplate() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const record = await fetchCourseTemplateByToken(token);

        if (cancelled) {
          return;
        }

        if (!record) {
          setErrorMessage("This course template could not be found.");
          setTemplateRecord(null);
          return;
        }

        setTemplateRecord(record);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The course template could not be loaded.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTemplate();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const selectedSemester =
    semesters.find((semester) => semester.id === targetSemesterId) ??
    semesters[0] ??
    null;
  const duplicateWarnings = useMemo(() => {
    if (!templateRecord || !selectedSemester) {
      return [];
    }

    return selectedSemester.courses.filter((course) => {
      const sameName =
        course.name.trim().toLowerCase() ===
        templateRecord.payload.name.trim().toLowerCase();
      const sameCode =
        course.code.trim().toLowerCase() ===
        templateRecord.payload.code.trim().toLowerCase();

      return sameName || sameCode;
    });
  }, [selectedSemester, templateRecord]);

  function handleImport() {
    if (!templateRecord || !selectedSemester) {
      return;
    }

    setIsImporting(true);

    const importedCourse = instantiateCourseFromTemplate(
      templateRecord.payload,
    );
    addCourseToSemester(selectedSemester.id, importedCourse);
    router.push(
      `/courses?semester=${encodeURIComponent(
        selectedSemester.id,
      )}&course=${encodeURIComponent(importedCourse.id)}`,
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
      <PageIntro
        badge="Course setup"
        className="mb-5 sm:mb-7"
        descriptionClassName="max-w-2xl text-sm sm:text-base"
        description="Review what is included, choose a semester, and add your own copy of this course to GradeLog."
        title="Add this course to a semester"
      />

      {isLoading ? (
        <Card className="rounded-[28px]" variant="surface-panel">
          <CardContent className="flex min-h-[18rem] flex-col items-center justify-center gap-3 p-6">
            <LoaderCircle className="h-6 w-6 animate-spin text-ink-muted" />
            <p className="text-sm text-ink-soft">Loading course setup</p>
          </CardContent>
        </Card>
      ) : errorMessage ? (
        <Card className="rounded-[28px] border-red-200 bg-red-50/80 dark:border-red-950/40 dark:bg-red-950/20">
          <CardContent className="flex items-start gap-3 p-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-300" />
            <div>
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Course setup unavailable
              </h2>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                {errorMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : templateRecord ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <Card className="rounded-[28px]" variant="surface-panel">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <SectionLabel className="text-[0.72rem]">
                    Course setup preview
                  </SectionLabel>
                  <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-foreground sm:text-[1.7rem]">
                    {templateRecord.payload.name}
                  </h2>
                  <p className="mt-2 text-sm text-ink-soft">
                    {templateRecord.payload.code} ·{" "}
                    {templateRecord.payload.instructor} ·{" "}
                    {templateRecord.payload.credits} credits
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
                  {templateRecord.payload.assessments.length} assessments
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Card className="rounded-[22px]" variant="surface-subtle">
                  <CardContent className="p-4">
                    <SectionLabel>Grade bands</SectionLabel>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {templateRecord.payload.gradeBands.map((band) => (
                        <span
                          className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-foreground"
                          key={`${band.label}-${band.threshold}`}
                        >
                          {band.label} {band.threshold}%
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[22px]" variant="surface-subtle">
                  <CardContent className="p-4">
                    <SectionLabel>Included</SectionLabel>
                    <p className="mt-3 text-sm text-ink-soft">
                      Assessment structure, weights, grade cutoffs, and grouped
                      items are included. Marks and scores are not.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-5 rounded-[24px]" variant="surface-subtle">
                <CardContent className="p-4 sm:p-5">
                  <SectionLabel>Included assignments</SectionLabel>
                  <div className="mt-4 grid gap-3">
                    {templateRecord.payload.assessments.map(
                      (assessment, index) => (
                        <div
                          className="rounded-[18px] border border-line bg-surface px-4 py-3"
                          key={`${assessment.name}-${index}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {assessment.name}
                              </p>
                              <p className="mt-1 text-xs text-ink-soft">
                                {assessment.kind === "group"
                                  ? "Tutorial group"
                                  : assessment.category}
                                {assessment.dueDate
                                  ? ` · Due ${assessment.dueDate}`
                                  : ""}
                              </p>
                            </div>
                            <span className="rounded-full border border-line bg-surface-panel px-2.5 py-1 text-xs font-medium text-ink-soft">
                              {assessment.weight}%
                            </span>
                          </div>
                          {assessment.kind === "group" ? (
                            <p className="mt-2 text-xs text-ink-soft">
                              {assessment.items.length} items · drop lowest{" "}
                              {assessment.dropLowest}
                            </p>
                          ) : (
                            <p className="mt-2 text-xs text-ink-soft">
                              Total possible: {assessment.totalPossible}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="h-max rounded-[28px]" variant="surface-panel">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 text-foreground">
                <Share2 className="h-4 w-4 text-ink-muted" />
                <h2 className="text-lg font-semibold">Choose a semester</h2>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="template-semester-select">Semester</Label>
                <Select
                  id="template-semester-select"
                  onChange={(event) => setTargetSemesterId(event.target.value)}
                  value={targetSemesterId}
                >
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                      {semester.periodLabel ? ` · ${semester.periodLabel}` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              {duplicateWarnings.length > 0 && !isImporting ? (
                <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900 dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-100">
                  You already have a similar course in this semester. You can
                  still add this copy.
                </div>
              ) : null}

              <Card className="mt-4 rounded-[20px]" variant="surface-subtle">
                <CardContent className="p-4 text-sm text-ink-soft">
                  This adds your own copy of the course to your semester. It
                  will not replace anything you already have, and it will not
                  stay linked to the original.
                </CardContent>
              </Card>

              <Button
                className="mt-5 w-full"
                disabled={!selectedSemester || isImporting}
                onClick={handleImport}
                type="button"
              >
                {isImporting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Add course
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
