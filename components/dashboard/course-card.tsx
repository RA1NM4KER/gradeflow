import { ArrowUpRight, Clock3, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatPercent,
  getAssessmentPace,
  getCourseCurrentGrade,
  getRemainingWeight,
} from "@/lib/grade-utils";
import { Course } from "@/lib/types";

interface CourseCardProps {
  course: Course;
  isActive: boolean;
  onSelect: () => void;
}

export function CourseCard({ course, isActive, onSelect }: CourseCardProps) {
  const currentGrade = getCourseCurrentGrade(course);
  const remainingWeight = getRemainingWeight(course);

  return (
    <Card
      className={[
        "transition-all duration-200",
        isActive
          ? "border-stone-950/20 bg-white shadow-soft"
          : "hover:-translate-y-0.5 hover:border-stone-300/90",
      ].join(" ")}
    >
      <CardContent className="p-0">
        <button
          className="flex w-full flex-col gap-5 p-6 text-left"
          onClick={onSelect}
          type="button"
        >
          <div
            className={`rounded-[26px] bg-gradient-to-br ${course.accent} p-5 text-stone-50 shadow-card`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-300">
                  {course.code}
                </p>
                <h3 className="mt-3 text-xl font-semibold leading-tight">
                  {course.name}
                </h3>
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-stone-100">
                {course.credits} credits
              </div>
            </div>
            <p className="mt-6 text-sm text-stone-300">{course.instructor}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                Standing
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                {formatPercent(currentGrade)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                Progress
              </p>
              <div className="mt-3 space-y-2">
                <Progress value={100 - remainingWeight} />
                <p className="text-sm text-stone-600">
                  {getAssessmentPace(course)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                Remaining
              </p>
              <div className="mt-3 space-y-2 text-sm text-stone-600">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-stone-500" />
                  <span>{remainingWeight}% still in play</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-stone-500" />
                  <span>{course.assessments.length} graded checkpoints</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">
              Open the course to inspect weighting and target scenarios.
            </p>
            <Button variant="ghost" size="sm" className="gap-2">
              View details
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}
