import { Semester } from "@/lib/types";

export interface SemesterSuggestion {
  name: string;
  periodLabel: string;
}

export function createSemester({
  name,
  periodLabel,
}: SemesterSuggestion): Semester {
  return {
    id: crypto.randomUUID(),
    name,
    periodLabel,
    modules: [],
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
