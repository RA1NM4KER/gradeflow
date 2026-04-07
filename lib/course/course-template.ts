import QRCode from "qrcode";

import {
  ASSESSMENT_KIND_GROUP,
  ASSESSMENT_KIND_SINGLE,
  ASSESSMENT_STATUS_ONGOING,
  GROUPED_ASSESSMENT_CATEGORY,
} from "@/lib/assessments/types";
import { Course, CourseTemplatePayload } from "@/lib/course/types";
import {
  courseTemplatePayloadSchema,
  courseTemplateRecordSchema,
  fetchedCourseTemplateRowSchema,
  sharedCourseTemplateRowSchema,
  sharedCourseTemplateSchema,
} from "@/lib/course/schemas";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/supabase-browser";
import { createUuid } from "@/lib/shared/uuid";

export type {
  CourseTemplatePayload,
  CourseTemplateRecord,
  SharedCourseTemplate,
} from "@/lib/course/types";

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([left], [right]) => left.localeCompare(right),
  );

  return `{${entries
    .map(
      ([key, entryValue]) =>
        `${JSON.stringify(key)}:${stableStringify(entryValue)}`,
    )
    .join(",")}}`;
}

async function sha256(input: string) {
  const encoded = new TextEncoder().encode(input);

  if (
    typeof window === "undefined" ||
    !("crypto" in window) ||
    !window.crypto.subtle
  ) {
    throw new Error("Secure hashing is unavailable in this browser.");
  }

  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export function buildCourseTemplatePayload(
  course: Course,
): CourseTemplatePayload {
  return courseTemplatePayloadSchema.parse({
    accent: course.accent,
    assessments: course.assessments.map((assessment) =>
      assessment.kind === ASSESSMENT_KIND_SINGLE
        ? {
            kind: ASSESSMENT_KIND_SINGLE,
            category: assessment.category,
            dueDate: assessment.dueDate,
            name: assessment.name,
            subminimumPercent: assessment.subminimumPercent,
            totalPossible: assessment.totalPossible,
            weight: assessment.weight,
          }
        : {
            kind: ASSESSMENT_KIND_GROUP,
            category: GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
            dropLowest: assessment.dropLowest,
            dueDate: assessment.dueDate,
            items: assessment.items.map((item) => ({
              label: item.label,
              totalPossible: item.totalPossible,
            })),
            name: assessment.name,
            weight: assessment.weight,
          },
    ),
    code: course.code,
    credits: course.credits,
    gradeBands: course.gradeBands.map((band) => ({
      label: band.label,
      threshold: band.threshold,
    })),
    instructor: course.instructor,
    name: course.name,
  });
}

export async function createCourseTemplateShare(course: Course) {
  const client = getSupabaseBrowserClient();

  if (!client || !isSupabaseConfigured()) {
    throw new Error("Course sharing is not configured in this build.");
  }

  const payload = buildCourseTemplatePayload(course);
  const contentHash = await sha256(stableStringify(payload));
  const { data, error } = await client.rpc("share_course_template", {
    template_hash: contentHash,
    template_payload: payload,
    template_title: `${course.code} ${course.name}`.trim(),
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data)
    ? sharedCourseTemplateRowSchema.optional().parse(data[0])
    : undefined;

  if (!row) {
    throw new Error("The shared course template could not be created.");
  }

  return sharedCourseTemplateSchema.parse({
    createdAt: row.created_at,
    publicToken: row.public_token,
    shareUrl: `${window.location.origin}/import-course-template?t=${encodeURIComponent(row.public_token)}`,
    title: row.title,
    updatedAt: row.updated_at,
  });
}

export async function fetchCourseTemplateByToken(token: string) {
  const client = getSupabaseBrowserClient();

  if (!client || !isSupabaseConfigured()) {
    throw new Error("Course sharing is not configured in this build.");
  }

  const { data, error } = await client.rpc("get_course_template_by_token", {
    template_token: token,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data)
    ? fetchedCourseTemplateRowSchema.optional().parse(data[0])
    : undefined;

  if (!row) {
    return null;
  }

  return courseTemplateRecordSchema.parse({
    createdAt: row.created_at,
    payload: row.course_payload,
    publicToken: row.public_token,
    title: row.title,
    updatedAt: row.updated_at,
  });
}

export async function buildCourseTemplateQrCode(shareUrl: string) {
  return await QRCode.toDataURL(shareUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
  });
}

export function instantiateCourseFromTemplate(
  payload: CourseTemplatePayload,
): Course {
  return {
    id: createUuid(),
    accent: payload.accent,
    assessments: payload.assessments.map((assessment) =>
      assessment.kind === ASSESSMENT_KIND_SINGLE
        ? {
            id: createUuid(),
            kind: ASSESSMENT_KIND_SINGLE,
            category: assessment.category,
            dueDate: assessment.dueDate,
            name: assessment.name,
            scoreAchieved: null,
            status: ASSESSMENT_STATUS_ONGOING,
            subminimumPercent:
              assessment.subminimumPercent !== undefined &&
              assessment.subminimumPercent !== null &&
              assessment.subminimumPercent > 0
                ? assessment.subminimumPercent
                : null,
            totalPossible: assessment.totalPossible,
            weight: assessment.weight,
          }
        : {
            id: createUuid(),
            kind: ASSESSMENT_KIND_GROUP,
            category: GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
            dropLowest: assessment.dropLowest,
            dueDate: assessment.dueDate,
            items: assessment.items.map((item) => ({
              id: createUuid(),
              label: item.label,
              scoreAchieved: null,
              totalPossible: item.totalPossible,
            })),
            name: assessment.name,
            status: ASSESSMENT_STATUS_ONGOING,
            weight: assessment.weight,
          },
    ),
    code: payload.code,
    credits: payload.credits,
    gradeBands: payload.gradeBands.map((band) => ({
      id: createUuid(),
      label: band.label,
      threshold: band.threshold,
    })),
    instructor: payload.instructor,
    name: payload.name,
  };
}
