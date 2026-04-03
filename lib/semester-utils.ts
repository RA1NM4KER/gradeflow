import { Semester } from "@/lib/types";
import { createUuid } from "@/lib/uuid";

export interface SemesterSuggestion {
  name: string;
  periodLabel: string;
}

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

  return [
    {
      name: `Spring ${year}`,
      periodLabel: "January to May",
    },
    {
      name: `Fall ${year}`,
      periodLabel: "August to December",
    },
    {
      name: `Semester 1 ${year}`,
      periodLabel: "January to June",
    },
    {
      name: `Semester 2 ${year}`,
      periodLabel: "July to November",
    },
  ];
}
