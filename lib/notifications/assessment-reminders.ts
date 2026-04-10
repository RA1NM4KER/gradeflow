"use client";

import { LocalNotifications } from "@capacitor/local-notifications";

import type { AppState } from "@/lib/app/types";
import type {
  AssessmentReminder,
  Course,
  SingleAssessment,
} from "@/lib/shared/types";
import { ASSESSMENT_REMINDER_MODE } from "@/lib/assessments/types";
import {
  hasDueDate,
  normalizeReminder,
} from "@/lib/assessments/reminder-utils";
import { isNativeApp } from "@/lib/platform/platform";

const MANAGED_REMINDER_IDS_STORAGE_KEY = "gradelog-managed-reminder-ids-v1";

interface ScheduledReminderNotification {
  at: Date;
  body: string;
  id: number;
  title: string;
}

export function getAssessmentReminderSnapshot(state: AppState) {
  return JSON.stringify(
    state.semesters.flatMap((semester) =>
      semester.courses.flatMap((course) =>
        course.assessments.flatMap((assessment) => {
          if (assessment.kind !== "single") {
            return [];
          }

          const reminder = normalizeReminder(
            assessment.dueDate,
            assessment.reminder,
          );

          return [
            {
              assessmentId: assessment.id,
              courseCode: course.code,
              dueDate: assessment.dueDate,
              name: assessment.name,
              reminder,
            },
          ];
        }),
      ),
    ),
  );
}

export async function reconcileAssessmentReminderNotifications(
  state: AppState,
) {
  if (typeof window === "undefined" || !isNativeApp()) {
    return;
  }

  const desiredNotifications = collectScheduledReminderNotifications(state);
  const desiredIds = desiredNotifications.map(
    (notification) => notification.id,
  );
  const managedIds = getManagedReminderIds();
  const idsToCancel = [...new Set([...managedIds, ...desiredIds])];

  if (idsToCancel.length > 0) {
    await LocalNotifications.cancel({
      notifications: idsToCancel.map((id) => ({ id })),
    });
  }

  if (desiredNotifications.length === 0) {
    setManagedReminderIds([]);
    return;
  }

  const permissionState = await ensureNotificationPermission();
  if (!permissionState) {
    setManagedReminderIds(desiredIds);
    return;
  }

  await LocalNotifications.schedule({
    notifications: desiredNotifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      schedule: {
        allowWhileIdle: true,
        at: notification.at,
      },
    })),
  });

  setManagedReminderIds(desiredIds);
}

function collectScheduledReminderNotifications(state: AppState) {
  return state.semesters.flatMap((semester) =>
    semester.courses.flatMap((course) =>
      course.assessments.flatMap((assessment) => {
        if (assessment.kind !== "single") {
          return [];
        }

        return buildScheduledReminderNotification(course, assessment);
      }),
    ),
  );
}

function buildScheduledReminderNotification(
  course: Course,
  assessment: SingleAssessment,
): ScheduledReminderNotification[] {
  if (!hasDueDate(assessment.dueDate)) {
    return [];
  }

  const reminder = normalizeReminder(assessment.dueDate, assessment.reminder);
  const scheduledAt = getReminderScheduleTime(assessment.dueDate, reminder);

  if (!reminder || !scheduledAt || scheduledAt.getTime() <= Date.now()) {
    return [];
  }

  return [
    {
      at: scheduledAt,
      body: `${course.code} is due on ${formatDueDateLabel(assessment.dueDate)}.`,
      id: getAssessmentReminderNotificationId(assessment.id),
      title: `Upcoming assignment: ${assessment.name}`,
    },
  ];
}

function getReminderScheduleTime(
  dueDate: string,
  reminder: AssessmentReminder | null,
) {
  if (!reminder) {
    return null;
  }

  switch (reminder.mode) {
    case ASSESSMENT_REMINDER_MODE.OFF:
      return null;
    case ASSESSMENT_REMINDER_MODE.DAY_BEFORE:
      return buildLocalDate(dueDate, -1, 18, 0);
    case ASSESSMENT_REMINDER_MODE.MORNING_OF:
      return buildLocalDate(dueDate, 0, 8, 0);
    case ASSESSMENT_REMINDER_MODE.CUSTOM:
      return buildLocalDateTime(reminder.customDateTime);
  }
}

function buildLocalDate(
  dueDate: string,
  dayOffset: number,
  hour: number,
  minute: number,
) {
  const [year, month, day] = dueDate.split("-").map(Number);
  const date = new Date(year, month - 1, day + dayOffset, hour, minute, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date;
}

function buildLocalDateTime(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) {
    return null;
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDueDateLabel(dueDate: string) {
  const [year, month, day] = dueDate.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getAssessmentReminderNotificationId(assessmentId: string) {
  let hash = 0;

  for (let index = 0; index < assessmentId.length; index += 1) {
    hash = (hash << 5) - hash + assessmentId.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash) || 1;
}

async function ensureNotificationPermission() {
  const currentPermission = await LocalNotifications.checkPermissions();

  if (currentPermission.display === "granted") {
    return true;
  }

  if (currentPermission.display !== "prompt") {
    return false;
  }

  const requestedPermission = await LocalNotifications.requestPermissions();
  return requestedPermission.display === "granted";
}

function getManagedReminderIds() {
  const raw = window.localStorage.getItem(MANAGED_REMINDER_IDS_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is number => typeof value === "number")
      : [];
  } catch {
    return [];
  }
}

function setManagedReminderIds(ids: number[]) {
  window.localStorage.setItem(
    MANAGED_REMINDER_IDS_STORAGE_KEY,
    JSON.stringify(ids),
  );
}
