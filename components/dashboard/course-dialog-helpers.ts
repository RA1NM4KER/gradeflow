import { GRADE_BAND_PRESETS } from "@/components/workspace/grades/grade-band-editor";
import { courseThemeOptions, getCourseTheme } from "@/lib/course/course-theme";
import { Course, GradeBand } from "@/lib/shared/types";
import { createUuid } from "@/lib/shared/uuid";

export const selectableCourseThemeOptions = courseThemeOptions.filter(
  (theme) => theme.id !== "violet",
);

export type CourseDialogFormState = {
  code: string;
  name: string;
  instructor: string;
  credits: string;
  accent: string;
};

function getDefaultGradeBands(): GradeBand[] {
  return GRADE_BAND_PRESETS.filter((band) =>
    ["A", "B", "C", "D"].includes(band.label),
  ).map((band) => ({
    id: createUuid(),
    label: band.label,
    threshold: band.threshold,
  }));
}

export function getInitialGradeBands(course?: Course) {
  return course?.gradeBands ?? getDefaultGradeBands();
}

export function getInitialFormState(course?: Course): CourseDialogFormState {
  return {
    code: course?.code ?? "",
    name: course?.name ?? "",
    instructor: course?.instructor ?? "",
    credits: String(course?.credits ?? 12),
    accent: getInitialCourseThemeId(course),
  };
}

function getInitialCourseThemeId(course?: Course) {
  const resolvedThemeId = course ? getCourseTheme(course).id : undefined;

  if (
    resolvedThemeId &&
    selectableCourseThemeOptions.some((theme) => theme.id === resolvedThemeId)
  ) {
    return resolvedThemeId;
  }

  return selectableCourseThemeOptions[0].id;
}
