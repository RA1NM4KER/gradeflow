import { ArrowLeft, Cog, FlaskConical, Share2 } from "lucide-react";

import { CourseDialog } from "@/components/dashboard/course-dialog";
import { ShareCourseTemplateDialog } from "@/components/workspace/shared/share-course-template-dialog";
import { Button } from "@/components/ui/button";
import { navigateCourses } from "@/lib/course/courses-navigation";
import { getExperimentTheme } from "@/lib/grades/experiment-theme";
import { cn } from "@/lib/shared/utils";
import { Course, Semester } from "@/lib/shared/types";
import { useTheme } from "@/components/theme/theme-provider";

export function CourseHeader({
  isExperimenting,
  module,
  onToggleExperiment,
  semesterName,
  semesterId,
  semesters,
  onSaveCourse,
  onDeleteCourse,
  onMoveCourse,
}: {
  isExperimenting: boolean;
  module: Course;
  onToggleExperiment: () => void;
  semesterName: string;
  semesterId: string;
  semesters: Pick<Semester, "id" | "name" | "periodLabel">[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onMoveCourse: (courseId: string, targetSemesterId: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Button
          className="h-auto gap-1.5 p-0 text-[0.82rem] text-ink-muted hover:bg-transparent hover:text-foreground sm:gap-2 sm:text-sm"
          onClick={() => navigateCourses("/courses")}
          size={null}
          type="button"
          variant="ghost"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {semesterName}
        </Button>
        <div className="mt-1 flex items-start gap-1.5 sm:mt-1.5 sm:items-center sm:gap-2">
          <h1 className="text-[1.15rem] font-semibold tracking-tight text-foreground sm:text-xl">
            {module.name}
          </h1>
          <CourseDialog
            availableSemesters={semesters}
            course={module}
            currentSemesterId={semesterId}
            onDeleteCourse={onDeleteCourse}
            onMoveCourse={onMoveCourse}
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
          <ShareCourseTemplateDialog
            course={module}
            triggerChildren={
              <Button
                aria-label="Share course template"
                className="group h-auto w-auto rounded-none border-0 bg-transparent p-0 text-ink-muted shadow-none hover:bg-transparent hover:text-ink-deep"
                size="icon"
                title="Share course template"
                type="button"
                variant="ghost"
              >
                <Share2 className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-6 sm:w-6" />
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
                  experimentTheme.accentPing1,
                )}
              />
              <span
                className={cn(
                  "pointer-events-none absolute -top-2 left-1/2 h-1 w-1 -translate-x-[1px] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:animate-ping",
                  experimentTheme.accentPing2,
                )}
                style={{ animationDelay: "120ms" }}
              />
              <span
                className={cn(
                  "pointer-events-none absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-[5px] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:animate-ping",
                  experimentTheme.accentPing3,
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
