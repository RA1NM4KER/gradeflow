export type AssessmentStatus = "completed" | "ongoing";

export interface Assessment {
  id: string;
  name: string;
  weight: number;
  scoreAchieved: number | null;
  totalPossible: number;
  dueDate: string;
  category: "exam" | "project" | "quiz" | "assignment" | "presentation";
  status: AssessmentStatus;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  accent: string;
  assessments: Assessment[];
}

export interface Semester {
  id: string;
  name: string;
  periodLabel: string;
  targetAverage: number;
  courses: Course[];
}

export interface SummaryMetric {
  label: string;
  value: string;
  detail: string;
}

export interface RequiredScoreResult {
  achievable: boolean;
  neededAverage: number;
  neededPoints: number;
  remainingWeight: number;
  message: string;
}
