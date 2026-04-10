import { z } from "zod";
import {
  ASSESSMENT_STATUSES,
  ASSESSMENT_KIND_GROUP,
  GROUPED_ASSESSMENT_CATEGORIES,
  ASSESSMENT_KIND_SINGLE,
  ASSESSMENT_REMINDER_MODES,
  SINGLE_ASSESSMENT_CATEGORIES,
} from "@/lib/assessments/types";

const rawGradeBandSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional(),
  threshold: z.number().optional(),
});

const rawGroupedAssessmentItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional(),
  scoreAchieved: z.number().nullable().optional(),
  totalPossible: z.number().optional(),
});

const rawSingleAssessmentSchema = z.object({
  id: z.string().optional(),
  kind: z.literal(ASSESSMENT_KIND_SINGLE).optional(),
  name: z.string().optional(),
  weight: z.number().optional(),
  dueDate: z.string().optional(),
  status: z.enum(ASSESSMENT_STATUSES).optional(),
  scoreAchieved: z.number().nullable().optional(),
  subminimumPercent: z.number().nullable().optional(),
  totalPossible: z.number().optional(),
  category: z.enum(SINGLE_ASSESSMENT_CATEGORIES).optional(),
  reminder: z
    .object({
      mode: z.enum(ASSESSMENT_REMINDER_MODES),
      customDateTime: z.string().optional(),
    })
    .nullable()
    .optional(),
});

const rawGroupedAssessmentSchema = z.object({
  id: z.string().optional(),
  kind: z.literal(ASSESSMENT_KIND_GROUP).optional(),
  name: z.string().optional(),
  weight: z.number().optional(),
  dueDate: z.string().optional(),
  status: z.enum(ASSESSMENT_STATUSES).optional(),
  category: z.enum(GROUPED_ASSESSMENT_CATEGORIES).optional(),
  dropLowest: z.number().optional(),
  items: z.array(rawGroupedAssessmentItemSchema).optional(),
});

const rawAssessmentSchema = z.union([
  rawSingleAssessmentSchema,
  rawGroupedAssessmentSchema,
]);

const rawCourseSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
  instructor: z.string().optional(),
  credits: z.number().optional(),
  accent: z.string().optional(),
  gradeBands: z.array(rawGradeBandSchema).optional(),
  assessments: z.array(rawAssessmentSchema).optional(),
});

const rawSemesterSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  periodLabel: z.string().optional(),
  courses: z.array(rawCourseSchema).optional(),
  modules: z.array(rawCourseSchema).optional(),
});

export const importedAppStateSchema = z.object({
  version: z.number().int().nonnegative().optional(),
  selectedSemesterId: z.string().optional(),
  semesters: z.array(rawSemesterSchema),
});
