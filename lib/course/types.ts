import {
  Assessment,
  GroupedAssessmentCategory,
  SingleAssessmentCategory,
} from "@/lib/assessments/types";
import { GradeBand } from "@/lib/grades/types";

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

export interface SemesterSuggestion {
  name: string;
  periodLabel: string;
}

export interface CourseTemplateBand {
  label: string;
  threshold: number;
}

export interface CourseTemplateSingleAssessment {
  kind: "single";
  category: SingleAssessmentCategory;
  dueDate: string;
  name: string;
  subminimumPercent?: number | null;
  totalPossible: number;
  weight: number;
}

export interface CourseTemplateGroupedItem {
  label: string;
  totalPossible: number;
}

export interface CourseTemplateGroupedAssessment {
  kind: "group";
  category: GroupedAssessmentCategory;
  dropLowest: number;
  dueDate: string;
  items: CourseTemplateGroupedItem[];
  name: string;
  weight: number;
}

export type CourseTemplateAssessment =
  | CourseTemplateSingleAssessment
  | CourseTemplateGroupedAssessment;

export interface CourseTemplatePayload {
  accent: string;
  assessments: CourseTemplateAssessment[];
  code: string;
  credits: number;
  gradeBands: CourseTemplateBand[];
  instructor: string;
  name: string;
}
export interface SharedCourseTemplate {
  createdAt: string;
  publicToken: string;
  shareUrl: string;
  title: string;
  updatedAt: string;
}

export interface CourseTemplateRecord {
  createdAt: string;
  payload: CourseTemplatePayload;
  publicToken: string;
  title: string;
  updatedAt: string;
}

export type CourseThemeMode = "light" | "dark";

export interface CourseTheme {
  id: string;
  name: string;
  band: string;
  chip: string;
  progressFill: string;
  tableHeader: string;
  tableHeaderDark: string;
  chartStripe: string;
  markerBorder: string;
  markerText: string;
  markerLine: string;
  chartMarkerBorder: string;
  chartMarkerText: string;
  chartMarkerLine: string;
  neededText: string;
  neededMuted: string;
  tableHeaderAccent: string;
  chartAccentBorder: string;
  chartAccentLine: string;
  chartAccentText: string;
  chartAccentTextMuted: string;
  neededAccentText: string;
}
