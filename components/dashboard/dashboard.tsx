"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookMarked,
  Calculator,
  CheckCheck,
  FolderPlus,
  GraduationCap,
  Sigma,
} from "lucide-react";

import { AssessmentDialog } from "@/components/dashboard/assessment-dialog";
import { AssessmentList } from "@/components/dashboard/assessment-list";
import { CalculatorPanel } from "@/components/dashboard/calculator-panel";
import { CourseCard } from "@/components/dashboard/course-card";
import { CourseDialog } from "@/components/dashboard/course-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatPercent,
  getCompletedWeight,
  getCourseCurrentGrade,
  getSemesterAverage,
  getSemesterCreditsCompleted,
  getSemesterGpa,
} from "@/lib/grade-utils";
import { demoSemester } from "@/lib/demo-data";
import { Assessment, Course } from "@/lib/types";

export function Dashboard() {
  const [semester, setSemester] = useState(demoSemester);
  const [selectedCourseId, setSelectedCourseId] = useState(
    semester.courses[0]?.id ?? "",
  );
  const [targetGrade, setTargetGrade] = useState(78);

  const selectedCourse =
    semester.courses.find((course) => course.id === selectedCourseId) ??
    semester.courses[0] ??
    null;

  function addCourse(course: Course) {
    setSemester((current) => ({
      ...current,
      courses: [...current.courses, course],
    }));
    setSelectedCourseId(course.id);
  }

  function addAssessment(courseId: string, assessment: Assessment) {
    setSemester((current) => ({
      ...current,
      courses: current.courses.map((course) =>
        course.id === courseId
          ? { ...course, assessments: [...course.assessments, assessment] }
          : course,
      ),
    }));
  }

  const average = getSemesterAverage(semester);
  const gpa = getSemesterGpa(semester);
  const completedCourses = semester.courses.filter(
    (course) => getCompletedWeight(course) >= 100,
  ).length;

  return (
    <div id="workspace" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
      <section className="grid gap-8 border-b border-stone-200/80 pb-12 pt-10 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 shadow-inset">
            Semester control center
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight text-stone-950 sm:text-6xl">
            See exactly where your semester stands, then move with confidence.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
            Gradeflow turns weighted coursework into a calm, legible workspace.
            No clutter, no guesswork, no portal-era design debt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href="#dashboard-overview">
                Explore dashboard
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="#calculator">Jump to calculator</a>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden bg-stone-950 text-stone-50">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                  {semester.name}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {semester.periodLabel}
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300">
                Target average {semester.targetAverage}%
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                  Current average
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatPercent(average)}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                  Current GPA
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {gpa.toFixed(2)}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                  Courses in motion
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {semester.courses.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        id="dashboard-overview"
        className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          detail="A weighted, credit-aware snapshot across your active courses."
          icon={<Sigma className="h-5 w-5" />}
          label="Semester average"
          value={formatPercent(average)}
        />
        <SummaryCard
          detail="GPA equivalent based on current weighted standing, not rough estimates."
          icon={<GraduationCap className="h-5 w-5" />}
          label="GPA"
          value={gpa.toFixed(2)}
        />
        <SummaryCard
          detail={`${completedCourses} of ${semester.courses.length} courses are fully graded.`}
          icon={<CheckCheck className="h-5 w-5" />}
          label="Completed courses"
          value={String(completedCourses)}
        />
        <SummaryCard
          detail={`${getSemesterCreditsCompleted(semester)} credits are already closed out this term.`}
          icon={<BookMarked className="h-5 w-5" />}
          label="Credits secured"
          value={String(getSemesterCreditsCompleted(semester))}
        />
      </section>

      <section className="mt-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                Courses
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                Active modules
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Every course carries its own weighting logic and target
                pressure.
              </p>
            </div>
            <CourseDialog onCreateCourse={addCourse} />
          </div>

          {semester.courses.length > 0 ? (
            <div className="grid gap-5">
              {semester.courses.map((course) => (
                <CourseCard
                  course={course}
                  isActive={selectedCourse?.id === course.id}
                  key={course.id}
                  onSelect={() => setSelectedCourseId(course.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              action={<CourseDialog onCreateCourse={addCourse} />}
              description="Create your first course to start mapping assessments and see how each weighting shapes your semester."
              icon={<FolderPlus className="h-5 w-5" />}
              title="No courses yet"
            />
          )}
        </div>

        <div id="calculator" className="space-y-5">
          {selectedCourse ? (
            <>
              <CalculatorPanel
                course={selectedCourse}
                onTargetGradeChange={setTargetGrade}
                targetGrade={targetGrade}
              />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Selected course
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-stone-950">
                    {selectedCourse.name}
                  </h3>
                  <p className="mt-1 text-sm text-stone-600">
                    Current standing{" "}
                    {formatPercent(getCourseCurrentGrade(selectedCourse))} in{" "}
                    {selectedCourse.code}
                  </p>
                </div>
                <AssessmentDialog
                  course={selectedCourse}
                  onCreateAssessment={addAssessment}
                />
              </div>
              {selectedCourse.assessments.length > 0 ? (
                <AssessmentList assessments={selectedCourse.assessments} />
              ) : (
                <EmptyState
                  action={
                    <AssessmentDialog
                      course={selectedCourse}
                      onCreateAssessment={addAssessment}
                    />
                  }
                  description="This course exists, but it has no grading checkpoints yet. Add the first assessment to make the calculator meaningful."
                  icon={<Calculator className="h-5 w-5" />}
                  title="No assessments yet"
                />
              )}
            </>
          ) : (
            <EmptyState
              description="Once you add a course, Gradeflow will generate a clean planning view with an explicit required-score model."
              icon={<Calculator className="h-5 w-5" />}
              title="Calculator waiting for course data"
            />
          )}
        </div>
      </section>
    </div>
  );
}
