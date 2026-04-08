import { z } from "zod";
import {
  GROUPED_ASSESSMENT_CATEGORIES,
  SINGLE_ASSESSMENT_CATEGORIES,
} from "@/lib/assessments/types";

import type {
  CourseTemplatePayload,
  CourseTemplateRecord,
  SharedCourseTemplate,
} from "@/lib/course/types";

const courseTemplateBandSchema = z.object({
  label: z.string(),
  threshold: z.number(),
});

const courseTemplateSingleAssessmentSchema = z.object({
  kind: z.literal("single"),
  category: z.enum(SINGLE_ASSESSMENT_CATEGORIES),
  dueDate: z.string(),
  name: z.string(),
  subminimumPercent: z.number().nullable().optional(),
  totalPossible: z.number(),
  weight: z.number(),
});

const courseTemplateGroupedItemSchema = z.object({
  label: z.string(),
  totalPossible: z.number(),
});

const courseTemplateGroupedAssessmentSchema = z.object({
  kind: z.literal("group"),
  category: z.enum(GROUPED_ASSESSMENT_CATEGORIES),
  dropLowest: z.number(),
  dueDate: z.string(),
  items: z.array(courseTemplateGroupedItemSchema),
  name: z.string(),
  weight: z.number(),
});

export const courseTemplatePayloadSchema: z.ZodType<CourseTemplatePayload> =
  z.object({
    accent: z.string(),
    assessments: z.array(
      z.union([
        courseTemplateSingleAssessmentSchema,
        courseTemplateGroupedAssessmentSchema,
      ]),
    ),
    code: z.string(),
    credits: z.number(),
    gradeBands: z.array(courseTemplateBandSchema),
    instructor: z.string(),
    name: z.string(),
  });

export const sharedCourseTemplateSchema: z.ZodType<SharedCourseTemplate> =
  z.object({
    createdAt: z.string(),
    publicToken: z.string(),
    shareUrl: z.url(),
    title: z.string(),
    updatedAt: z.string(),
  });

export const courseTemplateRecordSchema: z.ZodType<CourseTemplateRecord> =
  z.object({
    createdAt: z.string(),
    payload: courseTemplatePayloadSchema,
    publicToken: z.string(),
    title: z.string(),
    updatedAt: z.string(),
  });

export const sharedCourseTemplateRowSchema = z.object({
  created_at: z.string(),
  public_token: z.string(),
  title: z.string(),
  updated_at: z.string(),
});

export const fetchedCourseTemplateRowSchema =
  sharedCourseTemplateRowSchema.extend({
    course_payload: courseTemplatePayloadSchema,
  });
