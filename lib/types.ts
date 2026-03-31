export type AssessmentStatus = "completed" | "ongoing";
export type SingleAssessmentCategory =
  | "exam"
  | "project"
  | "quiz"
  | "assignment"
  | "presentation";
export type GroupedAssessmentCategory = "tutorials";
export interface AssessmentBase {
  id: string;
  name: string;
  weight: number;
  dueDate: string;
  status: AssessmentStatus;
}

export interface SingleAssessment extends AssessmentBase {
  kind: "single";
  scoreAchieved: number | null;
  totalPossible: number;
  category: SingleAssessmentCategory;
}

export interface GroupedAssessmentItem {
  id: string;
  label: string;
  scoreAchieved: number | null;
  totalPossible: number;
}

export interface GroupedAssessmentBase extends AssessmentBase {
  kind: "group";
  dropLowest: number;
  items: GroupedAssessmentItem[];
}

export interface TutorialsAssessment extends GroupedAssessmentBase {
  category: "tutorials";
}

export type GroupedAssessment = TutorialsAssessment;

export interface GroupedAssessmentDefinition {
  category: GroupedAssessmentCategory;
  label: string;
  itemPrefix: string;
  defaultName: string;
  defaultWeight: number;
  defaultItemCount: number;
  defaultDropLowest: number;
  dueDateLabel: string;
}
export type Assessment = SingleAssessment | GroupedAssessment;

export interface GradeBand {
  id: string;
  label: string;
  threshold: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  accent: string;
  gradeBands: GradeBand[];
  assessments: Assessment[];
}

export type Module = Course;

export interface Semester {
  id: string;
  name: string;
  periodLabel: string;
  courses: Course[];
  modules: Course[];
}
export interface RequiredScoreResult {
  achievable: boolean;
  neededAverage: number;
  neededPoints: number;
  remainingWeight: number;
  message: string;
}
