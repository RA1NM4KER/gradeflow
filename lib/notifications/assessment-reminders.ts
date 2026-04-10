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
const REMINDER_ID_MAP_STORAGE_KEY = "gradelog-reminder-id-map-v1";
const NEXT_REMINDER_ID_STORAGE_KEY = "gradelog-next-reminder-id-v1";

interface ScheduledReminderNotification {
  assessmentId: string;
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

  const desiredNotifications = assignNotificationIds(
    collectScheduledReminderNotifications(state),
  );
  const desiredIds = desiredNotifications.notifications.map(
    (notification) => notification.id,
  );
  const managedIds = getManagedReminderIds();
  const idsToCancel = [...new Set([...managedIds, ...desiredIds])];

  if (idsToCancel.length > 0) {
    await LocalNotifications.cancel({
      notifications: idsToCancel.map((id) => ({ id })),
    });
  }

  if (desiredNotifications.notifications.length === 0) {
    setManagedReminderIds([]);
    setReminderIdMap({});
    return;
  }

  const permissionState = await ensureNotificationPermission();
  if (!permissionState) {
    setManagedReminderIds(desiredIds);
    setReminderIdMap(desiredNotifications.idMap);
    return;
  }

  await LocalNotifications.schedule({
    notifications: desiredNotifications.notifications.map((notification) => ({
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
  setReminderIdMap(desiredNotifications.idMap);
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
      assessmentId: assessment.id,
      at: scheduledAt,
      body: `${course.code} is due on ${formatDueDateLabel(assessment.dueDate)}.`,
      id: 0,
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

function assignNotificationIds(notifications: ScheduledReminderNotification[]) {
  const currentMap = getReminderIdMap();
  const nextMap: Record<string, number> = {};
  let nextId = getNextReminderId();

  const assignedNotifications = notifications.map((notification) => {
    const existingId = currentMap[notification.assessmentId];
    const id = existingId ?? nextId++;

    nextMap[notification.assessmentId] = id;

    return {
      ...notification,
      id,
    };
  });

  setNextReminderId(nextId);

  return {
    idMap: nextMap,
    notifications: assignedNotifications,
  };
}

function getReminderIdMap() {
  const raw = window.localStorage.getItem(REMINDER_ID_MAP_STORAGE_KEY);

  if (!raw) {
    return {} as Record<string, number>;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, number] => typeof entry[1] === "number",
      ),
    );
  } catch {
    return {};
  }
}

function setReminderIdMap(idMap: Record<string, number>) {
  window.localStorage.setItem(
    REMINDER_ID_MAP_STORAGE_KEY,
    JSON.stringify(idMap),
  );
}

function getNextReminderId() {
  const raw = window.localStorage.getItem(NEXT_REMINDER_ID_STORAGE_KEY);
  const parsed = raw ? Number(raw) : 1;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function setNextReminderId(value: number) {
  window.localStorage.setItem(NEXT_REMINDER_ID_STORAGE_KEY, String(value));
}
