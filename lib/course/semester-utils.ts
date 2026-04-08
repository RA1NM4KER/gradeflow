import { Semester, SemesterSuggestion } from "@/lib/course/types";
import { createUuid } from "@/lib/shared/uuid";

const SEMESTER_SUGGESTION_TEMPLATES = [
  {
    nameTemplate: "Spring {year}",
    periodLabel: "January to May",
  },
  {
    nameTemplate: "Fall {year}",
    periodLabel: "August to December",
  },
  {
    nameTemplate: "Semester 1 {year}",
    periodLabel: "January to June",
  },
  {
    nameTemplate: "Semester 2 {year}",
    periodLabel: "July to November",
  },
] as const;

export function createSemester({
  name,
  periodLabel,
}: SemesterSuggestion): Semester {
  const courses: Semester["courses"] = [];

  return {
    id: createUuid(),
    name,
    periodLabel,
    courses,
    modules: courses,
  };
}

export function getSuggestedSemesters(date = new Date()): SemesterSuggestion[] {
  const year = date.getFullYear();

  return SEMESTER_SUGGESTION_TEMPLATES.map((template) => ({
    name: template.nameTemplate.replace("{year}", String(year)),
    periodLabel: template.periodLabel,
  }));
}
