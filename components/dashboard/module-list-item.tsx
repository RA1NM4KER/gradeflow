import { ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { getCourseTheme } from "@/lib/course-theme";
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
  module: Course;
  isActive: boolean;
  onSelect: () => void;
}

export function ModuleListItem({
  module,
  isActive,
  onSelect,
}: ModuleListItemProps) {
  const hasAssignments = module.assessments.length > 0;
  const hasRecordedGrade = hasRecordedCourseGrade(module);
  const grade = getCourseCurrentGrade(module);
  const remainingWeight = getRemainingWeight(module);
  const progressValue = hasAssignments ? 100 - remainingWeight : 0;
  const theme = getCourseTheme(module);

  return (
    <button
      className={cn(
        "group relative flex w-full overflow-hidden rounded-[20px] border border-stone-200 bg-white text-left transition-all duration-200 sm:rounded-[24px]",
        "shadow-card hover:-translate-y-0.5 hover:shadow-soft",
        isActive && "shadow-soft",
      )}
      onClick={onSelect}
      type="button"
    >
      <div
        className={cn("absolute inset-y-0 left-0 w-2.5 sm:w-3", theme.band)}
      />
      <div className="flex min-w-0 flex-1 flex-col px-3 py-2 pl-5 sm:px-3.5 sm:py-2.5 sm:pl-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 className="line-clamp-2 max-w-[14ch] text-[0.95rem] font-semibold leading-[1.05] tracking-[-0.025em] text-stone-950 sm:text-[1.1rem] sm:tracking-[-0.03em]">
                {module.name}
              </h3>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-stone-500 sm:text-[0.72rem] sm:tracking-[0.12em]">
                {module.code}
              </span>
            </div>
            <p className="mt-0.5 text-[0.82rem] text-stone-500 sm:mt-1 sm:text-[0.92rem]">
              {module.instructor} · {module.credits} credits
            </p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-950 text-stone-50 transition-transform duration-200 group-hover:translate-x-0.5 sm:h-9 sm:w-9">
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-medium sm:gap-2 sm:px-2.5 sm:text-[10px]",
              theme.chip,
            )}
          >
            {hasAssignments && remainingWeight === 0 ? (
              <CheckCircle2 className="h-2.5 w-2.5 text-stone-900 sm:h-3 sm:w-3" />
            ) : (
              <CircleDashed className="h-2.5 w-2.5 text-stone-500 sm:h-3 sm:w-3" />
            )}
            {!hasAssignments
              ? "Not started"
              : remainingWeight === 0
                ? "Complete"
                : `${remainingWeight}% remaining`}
          </span>
          <span className="rounded-full bg-stone-100 px-2 py-1 text-[9px] font-medium text-stone-600 sm:px-2.5 sm:text-[10px]">
            {getAssessmentPace(module)}
          </span>
        </div>

        <div className="mt-1.5 grid grid-cols-[1fr_auto] gap-2.5 sm:mt-2 sm:gap-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-400 sm:text-[10px] sm:tracking-[0.18em]">
              Current grade
            </p>
            <p className="mt-1 text-[1.28rem] font-semibold tracking-[-0.045em] text-stone-950 sm:text-[1.45rem] sm:tracking-[-0.05em]">
              {hasRecordedGrade ? formatPercent(grade) : "--"}
            </p>
          </div>
          <div className="self-start rounded-[12px] bg-stone-50 px-2 py-1.5 text-right sm:rounded-[14px] sm:px-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-400 sm:text-[10px] sm:tracking-[0.18em]">
              Assessments
            </p>
            <p className="mt-1 text-[0.82rem] font-semibold tracking-[-0.025em] text-stone-950 sm:text-[0.92rem] sm:tracking-[-0.03em]">
              {module.assessments.length}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500 sm:text-[10px] sm:tracking-[0.16em]">
            <span>Progress</span>
            <span>{progressValue.toFixed(0)}%</span>
          </div>
          <div className="mt-1">
            <Progress
              className="h-1 bg-stone-200/80"
              indicatorClassName={theme.progressFill}
              value={progressValue}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
