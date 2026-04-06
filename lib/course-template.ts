import QRCode from "qrcode";

import { Course } from "@/lib/types";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-browser";
import { createUuid } from "@/lib/uuid";

export interface CourseTemplateBand {
  label: string;
  threshold: number;
}

export interface CourseTemplateSingleAssessment {
  kind: "single";
  category: "exam" | "project" | "quiz" | "assignment" | "presentation";
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
  category: "tutorials";
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

interface SharedCourseTemplateRow {
  created_at: string;
  public_token: string;
  title: string;
  updated_at: string;
}

interface FetchedCourseTemplateRow extends SharedCourseTemplateRow {
  course_payload: CourseTemplatePayload;
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
  return {
    accent: course.accent,
    assessments: course.assessments.map((assessment) =>
      assessment.kind === "single"
        ? {
            kind: "single",
            category: assessment.category,
            dueDate: assessment.dueDate,
            name: assessment.name,
            subminimumPercent: assessment.subminimumPercent,
            totalPossible: assessment.totalPossible,
            weight: assessment.weight,
          }
        : {
            kind: "group",
            category: "tutorials",
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
  };
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
    ? (data[0] as SharedCourseTemplateRow | undefined)
    : undefined;

  if (!row) {
    throw new Error("The shared course template could not be created.");
  }

  return {
    createdAt: row.created_at,
    publicToken: row.public_token,
    shareUrl: `${window.location.origin}/import-course-template?t=${encodeURIComponent(row.public_token)}`,
    title: row.title,
    updatedAt: row.updated_at,
  } satisfies SharedCourseTemplate;
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
    ? (data[0] as FetchedCourseTemplateRow | undefined)
    : undefined;

  if (!row) {
    return null;
  }

  return {
    createdAt: row.created_at,
    payload: row.course_payload,
    publicToken: row.public_token,
    title: row.title,
    updatedAt: row.updated_at,
  } satisfies CourseTemplateRecord;
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
      assessment.kind === "single"
        ? {
            id: createUuid(),
            kind: "single",
            category: assessment.category,
            dueDate: assessment.dueDate,
            name: assessment.name,
            scoreAchieved: null,
            status: "ongoing",
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
            kind: "group",
            category: "tutorials",
            dropLowest: assessment.dropLowest,
            dueDate: assessment.dueDate,
            items: assessment.items.map((item) => ({
              id: createUuid(),
              label: item.label,
              scoreAchieved: null,
              totalPossible: item.totalPossible,
            })),
            name: assessment.name,
            status: "ongoing",
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
