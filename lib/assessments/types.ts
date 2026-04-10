export const ASSESSMENT_STATUS_COMPLETED = "completed";
export const ASSESSMENT_STATUS_ONGOING = "ongoing";

export const ASSESSMENT_STATUSES = [
  ASSESSMENT_STATUS_COMPLETED,
  ASSESSMENT_STATUS_ONGOING,
] as const;
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

export const ASSESSMENT_KIND_SINGLE = "single";
export const ASSESSMENT_KIND_GROUP = "group";

export const SINGLE_ASSESSMENT_CATEGORY = {
  EXAM: "exam",
  PROJECT: "project",
  QUIZ: "quiz",
  ASSIGNMENT: "assignment",
  PRESENTATION: "presentation",
} as const;

export const SINGLE_ASSESSMENT_CATEGORIES = [
  SINGLE_ASSESSMENT_CATEGORY.EXAM,
  SINGLE_ASSESSMENT_CATEGORY.PROJECT,
  SINGLE_ASSESSMENT_CATEGORY.QUIZ,
  SINGLE_ASSESSMENT_CATEGORY.ASSIGNMENT,
  SINGLE_ASSESSMENT_CATEGORY.PRESENTATION,
] as const;
export type SingleAssessmentCategory =
  (typeof SINGLE_ASSESSMENT_CATEGORIES)[number];

export const ASSESSMENT_REMINDER_MODE = {
  OFF: "off",
  DAY_BEFORE: "day_before",
  MORNING_OF: "morning_of",
  CUSTOM: "custom",
} as const;

export const ASSESSMENT_REMINDER_MODES = [
  ASSESSMENT_REMINDER_MODE.OFF,
  ASSESSMENT_REMINDER_MODE.DAY_BEFORE,
  ASSESSMENT_REMINDER_MODE.MORNING_OF,
  ASSESSMENT_REMINDER_MODE.CUSTOM,
] as const;
export type AssessmentReminderMode = (typeof ASSESSMENT_REMINDER_MODES)[number];

export interface AssessmentReminder {
  mode: AssessmentReminderMode;
  customDateTime?: string;
}

export const GROUPED_ASSESSMENT_CATEGORY = {
  TUTORIALS: "tutorials",
} as const;

export const GROUPED_ASSESSMENT_CATEGORIES = [
  GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
] as const;
export type GroupedAssessmentCategory =
  (typeof GROUPED_ASSESSMENT_CATEGORIES)[number];

export interface AssessmentBase {
  id: string;
  name: string;
  weight: number;
  dueDate: string;
  status: AssessmentStatus;
}

export interface SingleAssessment extends AssessmentBase {
  kind: typeof ASSESSMENT_KIND_SINGLE;
  scoreAchieved: number | null;
  subminimumPercent: number | null;
  totalPossible: number;
  category: SingleAssessmentCategory;
  reminder?: AssessmentReminder | null;
}

export interface GroupedAssessmentItem {
  id: string;
  label: string;
  scoreAchieved: number | null;
  totalPossible: number;
}

export interface GroupedAssessmentBase extends AssessmentBase {
  kind: typeof ASSESSMENT_KIND_GROUP;
  dropLowest: number;
  items: GroupedAssessmentItem[];
}

export interface TutorialsAssessment extends GroupedAssessmentBase {
  category: typeof GROUPED_ASSESSMENT_CATEGORY.TUTORIALS;
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
