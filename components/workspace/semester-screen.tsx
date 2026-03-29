"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, Plus } from "lucide-react";

import { CourseDialog } from "@/components/dashboard/course-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ModuleListItem } from "@/components/dashboard/module-list-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExperimentModePill } from "@/components/workspace/experiment-mode-pill";
import { SemesterSummaryStrip } from "@/components/workspace/semester-summary-strip";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  getCompletedWeight,
  getSemesterAverage,
  getSemesterGpa,
} from "@/lib/grade-utils";
import { Course } from "@/lib/types";

export function SemesterScreen({
  semesterIdFromUrl,
}: {
  semesterIdFromUrl?: string;
}) {
  const router = useRouter();
  const {
    semester,
    semesters,
    selectedSemesterId,
    addCourse,
    isExperimenting,
    selectSemester,
    stopExperiment,
    updateSemester,
  } = useWorkspace();

  const average = getSemesterAverage(semester);
  const gpa = getSemesterGpa(semester);
  const totalCredits = semester.courses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  const completedCourses = semester.courses.filter(
    (course) => getCompletedWeight(course) >= 100,
  ).length;

  function handleSaveCourse(course: Course) {
    addCourse(course);
    router.push(`/workspace/modules/${course.id}`);
  }

  useEffect(() => {
    if (
      semesterIdFromUrl &&
      semesterIdFromUrl !== selectedSemesterId &&
      semesters.some((item) => item.id === semesterIdFromUrl)
    ) {
      selectSemester(semesterIdFromUrl);
    }
  }, [selectSemester, selectedSemesterId, semesterIdFromUrl, semesters]);

  useEffect(() => {
    if (!selectedSemesterId || semesterIdFromUrl === selectedSemesterId) {
      return;
    }

    router.replace(`/workspace?semester=${selectedSemesterId}`);
  }, [router, selectedSemesterId, semesterIdFromUrl]);

  return (
    <div className="mx-auto h-[calc(100vh-5.5rem)] max-w-7xl overflow-hidden px-5 py-4 sm:px-8">
      {isExperimenting ? (
        <div className="mb-4">
          <ExperimentModePill onStop={stopExperiment} />
        </div>
      ) : null}

      <Card>
        <CardContent className="grid gap-4 p-4">
          <SemesterSummaryStrip
            average={average}
            credits={totalCredits}
            gpa={gpa}
            periodLabel={semester.periodLabel}
            semester={semester}
            semesterName={semester.name}
            onSaveSemester={(nextSemester) =>
              updateSemester(nextSemester.id, {
                name: nextSemester.name,
                periodLabel: nextSemester.periodLabel,
              })
            }
          />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <CardTitle className="text-base">Modules</CardTitle>
              <CardDescription className="mt-1">
                {semester.courses.length} active, {completedCourses} complete
              </CardDescription>
            </div>
            <p className="text-sm text-stone-500">Open a module</p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {semester.courses.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {semester.courses.map((course) => (
                <ModuleListItem
                  course={course}
                  isActive={false}
                  key={course.id}
                  onSelect={() =>
                    router.push(`/workspace/modules/${course.id}`)
                  }
                />
              ))}
              <CourseDialog
                onSaveCourse={handleSaveCourse}
                triggerAsChild
                triggerChildren={
                  <button
                    className="flex min-h-[238px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-stone-300 bg-transparent p-4 text-center text-stone-500 transition hover:border-stone-500 hover:text-stone-900"
                    type="button"
                  >
                    <Plus className="h-8 w-8" />
                    <span className="mt-3 text-sm font-semibold uppercase tracking-[0.22em]">
                      Add module
                    </span>
                  </button>
                }
              />
            </div>
          ) : (
            <EmptyState
              action={
                <CourseDialog
                  onSaveCourse={handleSaveCourse}
                  triggerAsChild
                  triggerChildren={
                    <button
                      className="flex min-h-[220px] w-full max-w-sm flex-col items-center justify-center rounded-[24px] border border-dashed border-stone-300 bg-transparent p-4 text-center text-stone-500 transition hover:border-stone-500 hover:text-stone-900"
                      type="button"
                    >
                      <Plus className="h-8 w-8" />
                      <span className="mt-3 text-sm font-semibold uppercase tracking-[0.22em]">
                        Add module
                      </span>
                    </button>
                  }
                />
              }
              description="Add your first module."
              icon={<BookMarked className="h-5 w-5" />}
              title="No modules yet"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
