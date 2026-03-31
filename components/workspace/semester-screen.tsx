"use client";

import { useEffect, useState } from "react";
import { BookMarked, Plus } from "lucide-react";

import { CourseDialog } from "@/components/dashboard/module-dialog";
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
import { useCourses } from "@/components/workspace/workspace-provider";
import {
  getCompletedWeight,
  getSemesterAverage,
  getSemesterGpa,
} from "@/lib/grade-utils";
import {
  addCoursesNavigationListener,
  navigateCourses,
} from "@/lib/workspace-navigation";
import { Course } from "@/lib/types";

export function SemesterScreen() {
  const [semesterIdFromUrl, setSemesterIdFromUrl] = useState<
    string | undefined
  >(undefined);
  const {
    semester,
    semesters,
    selectedSemesterId,
    addCourse,
    isExperimenting,
    selectSemester,
    stopExperiment,
    updateSemester,
  } = useCourses();

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
    navigateCourses(`/courses/${course.id}`);
  }

  useEffect(() => {
    function readSemesterIdFromLocation() {
      const nextSemesterId =
        new URLSearchParams(window.location.search).get("semester") ??
        undefined;

      setSemesterIdFromUrl((currentSemesterId) =>
        currentSemesterId === nextSemesterId
          ? currentSemesterId
          : nextSemesterId,
      );
    }

    readSemesterIdFromLocation();
    return addCoursesNavigationListener(readSemesterIdFromLocation);
  }, []);

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

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("semester", selectedSemesterId);

    // Keep the semester query in sync without asking App Router to perform
    // a navigation, which can trigger offline RSC fetch churn on refresh.
    window.history.replaceState(window.history.state, "", nextUrl);
    setSemesterIdFromUrl(selectedSemesterId);
  }, [selectedSemesterId, semesterIdFromUrl]);

  return (
    <div className="mx-auto h-[calc(100vh-5.5rem)] max-w-7xl overflow-auto px-4 py-4 sm:px-8 sm:py-6">
      {isExperimenting ? (
        <div className="pointer-events-none fixed left-1/2 top-[4.7rem] z-40 w-[calc(100%-2rem)] max-w-max -translate-x-1/2 sm:top-[5.25rem]">
          <div className="pointer-events-auto">
            <ExperimentModePill onStop={stopExperiment} />
          </div>
        </div>
      ) : null}

      <Card className="rounded-[28px] bg-transparent shadow-none sm:rounded-[34px]">
        <CardContent className="grid gap-4 p-0">
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

      <section className="mt-5 px-3 sm:mt-7 sm:px-7">
        <div>
          <h2 className="text-[1.55rem] font-semibold leading-none tracking-[-0.04em] text-stone-800 sm:text-[1.7rem]">
            Courses
          </h2>
          <div className="mt-2.5 flex flex-col items-start gap-1 sm:mt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <p className="text-[0.95rem] text-stone-600">
              {semester.courses.length} active, {completedCourses} complete
            </p>
            <p className="text-[0.92rem] text-stone-600">Open a course</p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          {semester.courses.length > 0 ? (
            <div className="grid items-start gap-3.5 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {semester.courses.map((module) => (
                <ModuleListItem
                  module={module}
                  isActive={false}
                  key={module.id}
                  onSelect={() => navigateCourses(`/courses/${module.id}`)}
                />
              ))}
              <CourseDialog
                onSaveCourse={handleSaveCourse}
                triggerAsChild
                triggerChildren={
                  <button
                    className="group relative flex w-full overflow-hidden rounded-[20px] border border-stone-200 bg-white text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-soft sm:rounded-[24px]"
                    type="button"
                  >
                    <div className="absolute inset-y-0 left-0 w-2.5 bg-[#e9e4dc] sm:w-3" />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pl-2.5 text-center text-stone-500 transition group-hover:text-stone-900 sm:pl-3">
                      <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
                      <span className="mt-2.5 text-[0.84rem] font-semibold uppercase tracking-[0.14em] sm:mt-3 sm:text-[0.92rem]">
                        Add course
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col px-3 py-2 pl-5 sm:px-3.5 sm:py-2.5 sm:pl-6">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 opacity-0">
                            <span className="text-[0.95rem] font-semibold leading-[1.05] tracking-[-0.025em] sm:text-[1.1rem] sm:tracking-[-0.03em]">
                              Placeholder
                            </span>
                            <span className="text-[0.65rem] font-medium uppercase tracking-[0.1em] sm:text-[0.72rem] sm:tracking-[0.12em]">
                              000
                            </span>
                          </div>
                          <p className="mt-0.5 text-[0.82rem] opacity-0 sm:mt-1 sm:text-[0.92rem]">
                            Placeholder · 00 credits
                          </p>
                        </div>
                        <span className="h-8 w-8 shrink-0 rounded-full opacity-0 sm:h-9 sm:w-9" />
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 opacity-0 sm:mt-2 sm:gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-medium sm:gap-2 sm:px-2.5 sm:text-[10px]">
                          Placeholder
                        </span>
                        <span className="rounded-full px-2 py-1 text-[9px] font-medium sm:px-2.5 sm:text-[10px]">
                          Placeholder
                        </span>
                      </div>

                      <div className="mt-1.5 grid grid-cols-[1fr_auto] gap-2.5 opacity-0 sm:mt-2 sm:gap-3">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.18em]">
                            Current grade
                          </p>
                          <p className="mt-1 text-[1.28rem] font-semibold tracking-[-0.045em] sm:text-[1.45rem] sm:tracking-[-0.05em]">
                            00.0%
                          </p>
                        </div>
                        <div className="self-start rounded-[12px] px-2 py-1.5 text-right sm:rounded-[14px] sm:px-2.5">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.18em]">
                            Assessments
                          </p>
                          <p className="mt-1 text-[0.82rem] font-semibold tracking-[-0.025em] sm:text-[0.92rem] sm:tracking-[-0.03em]">
                            0
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 opacity-0 sm:pt-2.5">
                        <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.16em]">
                          <span>Progress</span>
                          <span>0%</span>
                        </div>
                        <div className="mt-1 rounded-full p-[2px] sm:mt-1.5">
                          <div className="h-1 rounded-full" />
                        </div>
                      </div>
                    </div>
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
                      className="flex min-h-[260px] w-full max-w-sm flex-col items-center justify-center rounded-[28px] bg-[#f0ede7] p-6 text-center text-stone-500 shadow-card transition hover:bg-[#ebe7e0] hover:text-stone-900"
                      type="button"
                    >
                      <Plus className="h-8 w-8" />
                      <span className="mt-4 text-sm font-semibold uppercase tracking-[0.14em]">
                        Add course
                      </span>
                    </button>
                  }
                />
              }
              description="Add your first course."
              icon={<BookMarked className="h-5 w-5" />}
              title="No courses yet"
            />
          )}
        </div>
      </section>
    </div>
  );
}
