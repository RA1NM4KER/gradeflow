"use client";

import { Calculator } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { AssessmentTable } from "@/components/workspace/assessment-table";
import { CourseMobileOverview } from "@/components/workspace/course-mobile-overview";
import { ExperimentModePill } from "@/components/workspace/experiment-mode-pill";
import { GradeBandPanel } from "@/components/workspace/grade-band-panel";
import { CourseHeader } from "@/components/workspace/module-header";
import { useCourses } from "@/components/workspace/workspace-provider";
import { navigateCourses } from "@/lib/workspace-navigation";
import { Assessment, Course } from "@/lib/types";

export function CourseScreen({ moduleId }: { moduleId?: string }) {
  const {
    semester,
    addAssessment,
    deleteAssessment,
    isExperimenting,
    reorderAssessments,
    startExperiment,
    stopExperiment,
    updateAssessment,
    updateCourse,
  } = useCourses();
  const module = semester.courses.find((item) => item.id === moduleId) ?? null;

  function saveAssessment(nextModuleId: string, assessment: Assessment) {
    const exists = module?.assessments.some(
      (item) => item.id === assessment.id,
    );

    if (exists) {
      updateAssessment(nextModuleId, assessment);
      return;
    }

    addAssessment(nextModuleId, assessment);
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
              className="inline-flex h-11 items-center rounded-full bg-stone-950 px-5 text-sm font-semibold text-stone-50"
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
    <div className="mx-auto max-w-7xl overflow-auto px-4 py-3 pb-24 sm:h-[calc(100vh-5.5rem)] sm:overflow-hidden sm:px-8 sm:py-4 sm:pb-4">
      <div className="mb-3 sm:mb-4">
        <CourseHeader
          module={module}
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

      {isExperimenting ? (
        <div className="pointer-events-none fixed left-1/2 top-[4.7rem] z-40 w-[calc(100%-2rem)] max-w-max -translate-x-1/2 sm:top-[5.25rem]">
          <div className="pointer-events-auto">
            <ExperimentModePill onStop={stopExperiment} />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:hidden">
        <CourseMobileOverview
          isExperimenting={isExperimenting}
          module={module}
          onSaveBands={saveGradeBands}
        />
        <AssessmentTable
          onDeleteAssessment={deleteAssessment}
          module={module}
          isExperimenting={isExperimenting}
          onStartExperiment={startExperiment}
          onReorderAssessments={reorderAssessments}
          onSaveAssessment={saveAssessment}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-[#f7f4ee]/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {semester.courses.map((course) => {
            const isActive = course.id === module.id;

            return (
              <button
                className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-stone-950 bg-stone-950 text-stone-50"
                    : "border-stone-200 bg-white text-stone-600"
                }`}
                key={course.id}
                onClick={() => navigateCourses(`/courses/${course.id}`)}
                type="button"
              >
                <span className="block whitespace-nowrap">{course.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden min-h-0 gap-3 md:grid md:h-[calc(100%-5.5rem)] min-[900px]:grid-cols-[minmax(0,1fr)_560px] lg:gap-4">
        <div className="grid min-h-0">
          <AssessmentTable
            onDeleteAssessment={deleteAssessment}
            module={module}
            isExperimenting={isExperimenting}
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
    </div>
  );
}

export const ModuleScreen = CourseScreen;
