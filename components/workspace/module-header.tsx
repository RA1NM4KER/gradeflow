import { ArrowLeft, Cog } from "lucide-react";

import { CourseDialog } from "@/components/dashboard/module-dialog";
import { Button } from "@/components/ui/button";
import { navigateCourses } from "@/lib/workspace-navigation";
import { Course } from "@/lib/types";

export function CourseHeader({
  module,
  semesterName,
  onSaveCourse,
}: {
  module: Course;
  semesterName: string;
  onSaveCourse: (course: Course) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <button
          className="inline-flex items-center gap-1.5 text-[0.82rem] text-stone-500 transition hover:text-stone-950 sm:gap-2 sm:text-sm"
          onClick={() => navigateCourses("/courses")}
          type="button"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {semesterName}
        </button>
        <div className="mt-1 flex items-start gap-1.5 sm:mt-1.5 sm:items-center sm:gap-2">
          <h1 className="text-[1.15rem] font-semibold tracking-tight text-stone-950 sm:text-xl">
            {module.name}
          </h1>
          <CourseDialog
            course={module}
            onSaveCourse={onSaveCourse}
            triggerAsChild
            triggerChildren={
              <Button
                aria-label="Edit course"
                className="group h-auto w-auto rounded-none border-0 bg-transparent p-0 text-stone-500 shadow-none hover:bg-transparent hover:text-stone-800"
                size="icon"
                title="Edit course"
                type="button"
                variant="ghost"
              >
                <Cog className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90 sm:h-6 sm:w-6" />
              </Button>
            }
          />
        </div>
        <p className="mt-0.5 max-w-[34ch] text-[0.74rem] text-stone-600 sm:max-w-none sm:text-xs">
          {module.code} · Lecturer: {module.instructor} · {module.credits}{" "}
          credits
        </p>
      </div>
    </div>
  );
}

export const ModuleHeader = CourseHeader;
