"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { AlertTriangle, X } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { AssessmentTable } from "@/components/workspace/assessment-table";
import { CourseMobileOverview } from "@/components/workspace/course-mobile-overview";
import { ExperimentModePill } from "@/components/workspace/experiment-mode-pill";
import { FloatingStatusPill } from "@/components/workspace/floating-status-pill";
import { GradeBandPanel } from "@/components/workspace/grade-band-panel";
import { CourseHeader } from "@/components/workspace/module-header";
import { getCourseTheme } from "@/lib/course-theme";
import { cn } from "@/lib/utils";
import { useCourses } from "@/components/workspace/courses-provider";
import { navigateCourses } from "@/lib/courses-navigation";
import { formatPercent, getAssignedWeight } from "@/lib/grade-utils";
import { Assessment, Course } from "@/lib/types";

export function CourseScreen({ moduleId }: { moduleId?: string }) {
  const {
    semester,
    addAssessment,
    deleteAssessment,
    isExperimenting,
    recordGrade,
    reorderAssessments,
    startExperiment,
    stopExperiment,
    updateAssessment,
    updateCourse,
  } = useCourses();
  const module = semester.courses.find((item) => item.id === moduleId) ?? null;
  const [showWeightWarning, setShowWeightWarning] = useState(false);

  const assignedWeight = useMemo(
    () => (module ? getAssignedWeight(module) : 0),
    [module],
  );
  const hasOverweightAssignments = assignedWeight > 100;

  useEffect(() => {
    if (!hasOverweightAssignments) {
      setShowWeightWarning(false);
    }
  }, [hasOverweightAssignments]);

  useEffect(() => {
    setShowWeightWarning(false);
  }, [module?.id]);

  function maybeShowWeightWarning(
    previousAssessments: Course["assessments"],
    nextAssessments: Course["assessments"],
  ) {
    const previousAssignedWeight = previousAssessments.reduce(
      (sum, assessment) => {
        return sum + assessment.weight;
      },
      0,
    );
    const nextAssignedWeight = nextAssessments.reduce((sum, assessment) => {
      return sum + assessment.weight;
    }, 0);

    setShowWeightWarning(
      previousAssignedWeight <= 100 && nextAssignedWeight > 100,
    );
  }

  function saveAssessment(nextModuleId: string, assessment: Assessment) {
    const exists = module?.assessments.some(
      (item) => item.id === assessment.id,
    );
    const nextAssessments = exists
      ? (module?.assessments.map((item) =>
          item.id === assessment.id ? assessment : item,
        ) ?? [])
      : [...(module?.assessments ?? []), assessment];

    if (exists) {
      updateAssessment(nextModuleId, assessment);
    } else {
      addAssessment(nextModuleId, assessment);
    }

    maybeShowWeightWarning(module?.assessments ?? [], nextAssessments);
  }

  function updateGradeBand(bandId: string, threshold: number) {
    if (!module) {
      return;
    }

    updateCourse(module.id, {
      gradeBands: module.gradeBands.map((band) =>
        band.id === bandId
          ? { ...band, threshold: Math.min(Math.max(threshold || 0, 0), 100) }
          : band,
      ),
    });
  }

  function saveGradeBands(nextGradeBands: Course["gradeBands"]) {
    if (!module) {
      return;
    }

    updateCourse(module.id, {
      gradeBands: nextGradeBands,
    });
  }

  if (!module) {
    return (
      <div className="mx-auto max-w-5xl px-5 pb-10 pt-6 sm:px-8">
        <EmptyState
          action={
            <button
              className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
              onClick={() => navigateCourses("/courses")}
              type="button"
            >
              Back to semester
            </button>
          }
          description="The selected course could not be found."
          icon={<Calculator className="h-5 w-5" />}
          title="Course unavailable"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl overflow-auto px-4 py-3 pb-24 sm:h-[calc(100vh-5.5rem)] sm:overflow-hidden sm:px-8 sm:py-4 sm:pb-4 md:pb-6">
      <div className="mb-3 sm:mb-4">
        <CourseHeader
          isExperimenting={isExperimenting}
          module={module}
          onToggleExperiment={() =>
            isExperimenting ? stopExperiment() : startExperiment()
          }
          semesterName={semester.name}
          onSaveCourse={(nextModule) =>
            updateCourse(module.id, {
              accent: nextModule.accent,
              code: nextModule.code,
              credits: nextModule.credits,
              gradeBands: module.gradeBands,
              instructor: nextModule.instructor,
              name: nextModule.name,
            })
          }
        />
      </div>

      {isExperimenting ||
      (module && hasOverweightAssignments && showWeightWarning) ? (
        <div className="pointer-events-none fixed left-1/2 top-[4.7rem] z-40 flex w-[calc(100%-2rem)] max-w-[min(100%,44rem)] -translate-x-1/2 flex-col items-center gap-2 sm:top-[5.25rem]">
          {isExperimenting ? (
            <div className="pointer-events-auto">
              <ExperimentModePill onStopAction={stopExperiment} />
            </div>
          ) : null}
          {module && hasOverweightAssignments && showWeightWarning ? (
            <div className="pointer-events-auto w-full max-w-max">
              <FloatingStatusPill
                actionIcon={<X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                actionLabel="Dismiss"
                icon={<AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                onAction={() => setShowWeightWarning(false)}
                subtitle={`This course is set to ${formatPercent(assignedWeight)} in total. Course weights should usually add up to 100%.`}
                title="Assignment weights are over 100%"
                tone="danger"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 md:hidden">
        <CourseMobileOverview
          isExperimenting={isExperimenting}
          module={module}
          onSaveBandsAction={saveGradeBands}
        />
        <AssessmentTable
          onDeleteAssessment={deleteAssessment}
          module={module}
          isExperimenting={isExperimenting}
          onRecordGrade={recordGrade}
          onStartExperiment={startExperiment}
          onReorderAssessments={reorderAssessments}
          onSaveAssessment={saveAssessment}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line/80 bg-surface-footer/88 backdrop-blur-xl md:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <CourseSwitcher
            semesterCourses={semester.courses}
            activeCourseId={module.id}
          />
        </div>
      </div>

      <div className="hidden min-h-0 gap-3 md:grid md:h-[calc(100%-9.5rem)] min-[900px]:grid-cols-[minmax(0,1fr)_560px] lg:gap-4">
        <div className="grid min-h-0">
          <AssessmentTable
            onDeleteAssessment={deleteAssessment}
            module={module}
            isExperimenting={isExperimenting}
            onRecordGrade={recordGrade}
            onStartExperiment={startExperiment}
            onReorderAssessments={reorderAssessments}
            onSaveAssessment={saveAssessment}
          />
        </div>

        <div className="grid min-h-0 content-start gap-3 overflow-visible sm:gap-4 sm:overflow-y-auto sm:pr-1">
          <GradeBandPanel
            isExperimenting={isExperimenting}
            module={module}
            onUpdateGradeBand={updateGradeBand}
          />
        </div>
      </div>

      <div className="hidden border-t border-line/80 bg-surface-footer/88 pt-4 backdrop-blur-xl md:mt-4 md:block">
        <CourseSwitcher
          semesterCourses={semester.courses}
          activeCourseId={module.id}
          className="pb-1"
          itemClassName="rounded-xl px-5 py-3.5 text-base"
          indicatorClassName="h-2"
        />
      </div>
    </div>
  );
}

export const ModuleScreen = CourseScreen;

function CourseSwitcher({
  semesterCourses,
  activeCourseId,
  className,
  itemClassName,
  indicatorClassName,
}: {
  semesterCourses: Course[];
  activeCourseId: string;
  className?: string;
  itemClassName?: string;
  indicatorClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {semesterCourses.map((course) => {
        const isActive = course.id === activeCourseId;
        const courseTheme = getCourseTheme(course);

        return (
          <button
            className={cn(
              "group relative shrink-0 overflow-hidden rounded-lg border px-3.5 py-2.5 text-left text-sm shadow-sm transition-all duration-200",
              itemClassName,
              isActive
                ? "border-line/70 bg-surface text-foreground shadow-[0_10px_24px_rgba(28,25,23,0.08)]"
                : "border-line/70 bg-surface/82 text-ink-soft hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface",
            )}
            key={course.id}
            onClick={() =>
              navigateCourses(
                `/courses?course=${encodeURIComponent(course.id)}`,
              )
            }
            type="button"
          >
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 h-1.5",
                indicatorClassName,
                courseTheme.band,
                !isActive && "opacity-65 group-hover:opacity-100",
              )}
            />
            <span className="block whitespace-nowrap font-semibold tracking-[-0.01em]">
              {course.code}
            </span>
          </button>
        );
      })}
    </div>
  );
}
