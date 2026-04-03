import { ArrowLeft, Cog, FlaskConical } from "lucide-react";

import { CourseDialog } from "@/components/dashboard/course-dialog";
import { Button } from "@/components/ui/button";
import { navigateCourses } from "@/lib/courses-navigation";
import { getExperimentTheme } from "@/lib/experiment-theme";
import { cn } from "@/lib/utils";
import { Course } from "@/lib/types";
import { useTheme } from "@/components/theme/theme-provider";

export function CourseHeader({
  isExperimenting,
  module,
  onToggleExperiment,
  semesterName,
  onSaveCourse,
}: {
  isExperimenting: boolean;
  module: Course;
  onToggleExperiment: () => void;
  semesterName: string;
  onSaveCourse: (course: Course) => void;
}) {
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <button
          className="inline-flex items-center gap-1.5 text-[0.82rem] text-ink-muted transition hover:text-foreground sm:gap-2 sm:text-sm"
          onClick={() => navigateCourses("/courses")}
          type="button"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {semesterName}
        </button>
        <div className="mt-1 flex items-start gap-1.5 sm:mt-1.5 sm:items-center sm:gap-2">
          <h1 className="text-[1.15rem] font-semibold tracking-tight text-foreground sm:text-xl">
            {module.name}
          </h1>
          <CourseDialog
            course={module}
            onSaveCourse={onSaveCourse}
            triggerAsChild
            triggerChildren={
              <Button
                aria-label="Edit course"
                className="group h-auto w-auto rounded-none border-0 bg-transparent p-0 text-ink-muted shadow-none hover:bg-transparent hover:text-ink-deep"
                size="icon"
                title="Edit course"
                type="button"
                variant="ghost"
              >
                <Cog className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90 sm:h-6 sm:w-6" />
              </Button>
            }
          />
          <Button
            aria-label={
              isExperimenting ? "Exit what-if mode" : "Start what-if mode"
            }
            className={cn(
              "group ml-1 hidden md:inline-flex h-8 items-center justify-center gap-1.5 rounded-full border px-3 text-[0.78rem] font-medium transition",
              isExperimenting
                ? `border-white/24 bg-white/16 ${experimentTheme.accentTextStrong} hover:bg-white/22 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14`
                : `border-line bg-surface text-ink-soft hover:bg-surface-muted ${experimentTheme.hoverText}`,
            )}
            onClick={onToggleExperiment}
            title={isExperimenting ? "Exit what-if mode" : "Start what-if mode"}
            type="button"
            variant="ghost"
          >
            <span className="icon-group relative inline-flex h-3.5 w-3.5 items-center justify-center">
              <span
                className={cn(
                  "pointer-events-none absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-[7px] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:animate-ping",
                  resolvedTheme === "dark"
                    ? "bg-violet-300/0 group-hover:bg-violet-300/65"
                    : "bg-violet-400/0 group-hover:bg-violet-400/80",
                )}
              />
              <span
                className={cn(
                  "pointer-events-none absolute -top-2 left-1/2 h-1 w-1 -translate-x-[1px] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:animate-ping",
                  resolvedTheme === "dark"
                    ? "bg-violet-200/0 group-hover:bg-violet-200/70"
                    : "bg-violet-300/0 group-hover:bg-violet-300/90",
                )}
                style={{ animationDelay: "120ms" }}
              />
              <span
                className={cn(
                  "pointer-events-none absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-[5px] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:animate-ping",
                  resolvedTheme === "dark"
                    ? "bg-violet-100/0 group-hover:bg-violet-100/80"
                    : "bg-violet-200/0 group-hover:bg-violet-200/90",
                )}
                style={{ animationDelay: "240ms" }}
              />
              <FlaskConical className="-scale-x-100 h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-12" />
            </span>
            What-if
          </Button>
        </div>
        <p className="mt-0.5 max-w-[34ch] text-[0.74rem] text-ink-soft sm:max-w-none sm:text-xs">
          {module.code} · Lecturer: {module.instructor} · {module.credits}{" "}
          credits
        </p>
      </div>
    </div>
  );
}
