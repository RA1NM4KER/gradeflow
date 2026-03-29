import { ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  formatPercent,
  getAssessmentPace,
  getCourseCurrentGrade,
  getRemainingWeight,
  hasRecordedCourseGrade,
} from "@/lib/grade-utils";
import { Course } from "@/lib/types";

interface ModuleListItemProps {
  course: Course;
  isActive: boolean;
  onSelect: () => void;
}

export function ModuleListItem({
  course,
  isActive,
  onSelect,
}: ModuleListItemProps) {
  const hasAssignments = course.assessments.length > 0;
  const hasRecordedGrade = hasRecordedCourseGrade(course);
  const grade = getCourseCurrentGrade(course);
  const remainingWeight = getRemainingWeight(course);
  const progressValue = hasAssignments ? 100 - remainingWeight : 0;

  return (
    <button
      className={cn(
        "group flex h-full w-full flex-col rounded-[24px] border p-4 text-left transition-all duration-200",
        "bg-white/80 hover:border-stone-300 hover:bg-white",
        isActive && "border-stone-950/20 bg-white shadow-card",
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-600">
              {course.code}
            </span>
            <span className="text-xs text-stone-500 sm:text-sm">
              {course.credits} credits
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <div className="flex items-center gap-2 self-start rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] text-stone-600 sm:px-3 sm:py-1.5 sm:text-xs">
            {hasAssignments && remainingWeight === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-stone-900" />
            ) : (
              <CircleDashed className="h-4 w-4 text-stone-500" />
            )}
            {!hasAssignments
              ? "Not started"
              : remainingWeight === 0
                ? "Complete"
                : `${remainingWeight}% remaining`}
          </div>
          <ArrowRight className="mt-1 h-5 w-5 text-stone-400 transition group-hover:text-stone-900" />
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="min-h-[72px]">
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-stone-950 sm:text-lg">
            {course.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-stone-600">
            {course.instructor}
          </p>
        </div>
        <div className="mt-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Current grade
          </p>
          <p className="mt-1 text-[1.65rem] font-semibold tracking-tight text-stone-950 sm:text-2xl">
            {hasRecordedGrade ? formatPercent(grade) : "--"}
          </p>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            <span>Assignment progress</span>
            <span>
              {hasAssignments ? getAssessmentPace(course) : "0/0 DONE"}
            </span>
          </div>
          <Progress className="mt-3" value={progressValue} />
        </div>
      </div>
    </button>
  );
}
