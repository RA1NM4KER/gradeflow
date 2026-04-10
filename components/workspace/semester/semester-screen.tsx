"use client";

import { BookMarked, Plus } from "lucide-react";

import { CourseDialog } from "@/components/dashboard/course-dialog";
import { CourseListItem } from "@/components/dashboard/course-list-item";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ExperimentModePill } from "@/components/workspace/shared/experiment-mode-pill";
import { SemesterSummaryStat } from "@/components/workspace/semester/semester-summary-stat";
import { SemesterSummaryStrip } from "@/components/workspace/semester/semester-summary-strip";
import { useCourses } from "@/components/workspace/shared/courses-provider";
import {
  navigateCourses,
  useCoursesLocation,
} from "@/lib/course/courses-navigation";
import {
  getCompletedWeight,
  getSemesterAverage,
  getSemesterGpa,
} from "@/lib/grades/grade-utils";
import { Course } from "@/lib/shared/types";

export function SemesterScreen() {
  const coursesLocation = useCoursesLocation();
  const {
    semester,
    semesters,
    addCourse,
    isExperimenting,
    stopExperiment,
    updateSemester,
  } = useCourses();

  const isAllCoursesView = coursesLocation.scope === "all";
  const average = getSemesterAverage(semester);
  const gpa = getSemesterGpa(semester);
  const totalCredits = semester.courses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  const completedCourses = semester.courses.filter(
    (course) => getCompletedWeight(course) >= 100,
  ).length;
  const allCourseEntries = semesters.flatMap((item) =>
    item.courses.map((course) => ({
      course,
      semesterId: item.id,
      semesterName: item.name,
    })),
  );
  const displayedCourseEntries = isAllCoursesView
    ? allCourseEntries
    : semester.courses.map((course) => ({
        course,
        semesterId: semester.id,
        semesterName: semester.name,
      }));
  const allCompletedCourses = allCourseEntries.filter(
    ({ course }) => getCompletedWeight(course) >= 100,
  ).length;

  function handleSaveCourse(course: Course) {
    addCourse(course);
    navigateCourses(
      `/courses?semester=${encodeURIComponent(
        semester.id,
      )}&course=${encodeURIComponent(course.id)}`,
    );
  }

  function showAllCourses() {
    navigateCourses("/courses?scope=all");
  }

  function showSemesterCourses(nextSemesterId: string) {
    navigateCourses(`/courses?semester=${encodeURIComponent(nextSemesterId)}`);
  }

  function handleScopeChange(value: string) {
    if (value === "all") {
      showAllCourses();
      return;
    }

    showSemesterCourses(value);
  }

  return (
    <div className="mx-auto max-w-7xl overflow-auto px-4 py-4 sm:px-8 sm:py-6 ">
      {isExperimenting ? (
        <div className="pointer-events-none fixed left-1/2 top-[4.7rem] z-40 w-[calc(100%-2rem)] max-w-max -translate-x-1/2 sm:top-[5.25rem]">
          <div className="pointer-events-auto">
            <ExperimentModePill onStopAction={stopExperiment} />
          </div>
        </div>
      ) : null}

      {isAllCoursesView ? (
        <Card className="rounded-[20px] bg-[hsl(var(--surface))] px-3 py-3 shadow-none sm:rounded-[26px] sm:px-6 sm:py-5">
          <CardContent className="grid gap-3 p-0 sm:gap-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
              <div>
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:text-[0.7rem]">
                  Courses
                </p>
                <p className="mt-1 text-[1.28rem] font-semibold leading-none tracking-[-0.035em] text-foreground sm:text-[1.95rem] sm:tracking-[-0.04em]">
                  All courses
                </p>
                <p className="mt-2 hidden max-w-2xl text-[0.9rem] leading-6 text-ink-soft sm:block">
                  Browse every course across your semesters, then jump into any
                  course without going back home.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 self-start sm:gap-3">
                <SemesterSummaryStat
                  label="Courses"
                  value={String(allCourseEntries.length)}
                />
                <SemesterSummaryStat
                  label="Complete"
                  value={String(allCompletedCourses)}
                />
                <SemesterSummaryStat
                  label="Semesters"
                  value={String(semesters.length)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
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
      )}

      <section className="mt-4 px-3 sm:mt-7 sm:px-7">
        <div>
          <h2 className="text-[1.55rem] font-semibold leading-none tracking-[-0.04em] text-foreground sm:text-[1.7rem]">
            Courses
          </h2>
          <div className="mt-2.5 flex items-center justify-between gap-3 sm:mt-3 sm:items-end sm:gap-4">
            <p className="min-w-0 whitespace-nowrap text-[0.95rem] text-ink-soft">
              {displayedCourseEntries.length} active,{" "}
              {isAllCoursesView ? allCompletedCourses : completedCourses}{" "}
              complete
            </p>
            <div className="w-[9.75rem] shrink-0 sm:w-[11.5rem]">
              <Select
                aria-label="Filter courses by semester"
                className="h-9 rounded-full border-line/80 bg-surface-soft px-3 pr-8 text-[0.82rem] shadow-none"
                onChange={(event) => handleScopeChange(event.target.value)}
                value={isAllCoursesView ? "all" : semester.id}
              >
                <option value="all">All courses</option>
                {semesters.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          {displayedCourseEntries.length > 0 ? (
            <div className="grid items-start gap-3.5 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {displayedCourseEntries.map((entry) => (
                <CourseListItem
                  contextLabel={
                    isAllCoursesView ? entry.semesterName : undefined
                  }
                  course={entry.course}
                  isActive={false}
                  key={`${entry.semesterId}:${entry.course.id}`}
                  onSelect={() =>
                    navigateCourses(
                      `/courses?semester=${encodeURIComponent(
                        entry.semesterId,
                      )}&course=${encodeURIComponent(entry.course.id)}`,
                    )
                  }
                />
              ))}
              <CourseDialog
                onSaveCourse={handleSaveCourse}
                triggerAsChild
                triggerChildren={
                  <button
                    className="group relative flex w-full overflow-hidden rounded-[20px] border border-line bg-surface text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-soft sm:rounded-[24px]"
                    type="button"
                  >
                    <div className="absolute inset-y-0 left-0 w-2.5 bg-surface-strip sm:w-3" />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pl-2.5 text-center text-ink-muted transition group-hover:text-foreground sm:pl-3">
                      <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
                      <span className="mt-2.5 text-[0.84rem] font-semibold uppercase tracking-[0.14em] sm:mt-3 sm:text-[0.92rem]">
                        {isAllCoursesView
                          ? `Add to ${semester.name}`
                          : "Add course"}
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
                      className="flex min-h-[260px] w-full max-w-sm flex-col items-center justify-center rounded-[28px] bg-surface-panel p-6 text-center text-ink-muted shadow-card transition hover:bg-surface-panel-hover hover:text-foreground"
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
