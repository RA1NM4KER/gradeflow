"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Share2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseTemplateAssessmentPreview } from "@/components/course-template/parts/course-template-assessment-preview";
import { CourseTemplateChip } from "@/components/course-template/parts/course-template-chip";
import { CourseTemplateImportErrorState } from "@/components/course-template/parts/course-template-import-error-state";
import { CourseTemplateImportPanel } from "@/components/course-template/parts/course-template-import-panel";
import { LoadingCard } from "@/components/ui/loading-card";
import { NoticePanel } from "@/components/ui/notice-panel";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageContainer } from "@/components/ui/page-container";
import { PageIntro } from "@/components/ui/page-intro";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SectionLabel } from "@/components/ui/section-label";
import { useCourses } from "@/components/workspace/shared/courses-provider";
import {
  fetchCourseTemplateByToken,
  instantiateCourseFromTemplate,
  CourseTemplateRecord,
} from "@/lib/course/course-template";

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
    <PageContainer className="px-4 py-6 sm:py-8">
      <PageIntro
        badge="Course setup"
        className="mb-5 sm:mb-7"
        descriptionClassName="max-w-2xl text-sm sm:text-base"
        description="Review what is included, choose a semester, and add your own copy of this course to GradeLog."
        title="Add this course to a semester"
      />

      {isLoading ? (
        <LoadingCard
          cardClassName="rounded-[28px]"
          message="Loading course setup"
        />
      ) : errorMessage ? (
        <CourseTemplateImportErrorState message={errorMessage} />
      ) : templateRecord ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <CourseTemplateImportPanel className="rounded-[28px]">
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
              <CourseTemplateChip className="text-ink-soft">
                {templateRecord.payload.assessments.length} assessments
              </CourseTemplateChip>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Card className="rounded-[22px]" variant="surface-subtle">
                <CardContent className="p-4">
                  <SectionLabel>Grade bands</SectionLabel>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {templateRecord.payload.gradeBands.map((band) => (
                      <CourseTemplateChip
                        key={`${band.label}-${band.threshold}`}
                      >
                        {band.label} {band.threshold}%
                      </CourseTemplateChip>
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
                      <CourseTemplateAssessmentPreview
                        assessment={assessment}
                        key={`${assessment.name}-${index}`}
                      />
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </CourseTemplateImportPanel>

          <CourseTemplateImportPanel className="h-max rounded-[28px]">
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
              <NoticePanel className="mt-4 rounded-[20px]" tone="warning">
                You already have a similar course in this semester. You can
                still add this copy.
              </NoticePanel>
            ) : null}

            <Card className="mt-4 rounded-[20px]" variant="surface-subtle">
              <CardContent className="p-4 text-sm text-ink-soft">
                This adds your own copy of the course to your semester. It will
                not replace anything you already have, and it will not stay
                linked to the original.
              </CardContent>
            </Card>

            <Button
              className="mt-5 w-full"
              disabled={!selectedSemester || isImporting}
              onClick={handleImport}
              type="button"
            >
              {isImporting ? (
                <LoadingSpinner />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Add course
            </Button>
          </CourseTemplateImportPanel>
        </div>
      ) : null}
    </PageContainer>
  );
}
