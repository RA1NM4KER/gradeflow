import { Semester } from "@/lib/types";

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
    id: crypto.randomUUID(),
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
      name: `Semester 1 ${year}`,
      periodLabel: "January to June",
    },
    {
      name: `Semester 2 ${year}`,
      periodLabel: "July to November",
    },
  ];
}
