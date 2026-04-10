import {
  ASSESSMENT_REMINDER_MODE,
  ASSESSMENT_REMINDER_MODES,
  AssessmentReminder,
  AssessmentReminderMode,
} from "@/lib/assessments/types";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function hasDueDate(value: string) {
  return value.trim().length > 0;
}

export function validateDueDate(value: string) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return { valid: true, message: "" };
  }

  const match = DATE_PATTERN.exec(trimmed);
  if (!match) {
    return { valid: false, message: "Use YYYY-MM-DD." };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  const isValidDate =
    Number.isFinite(year) &&
    Number.isFinite(month) &&
    Number.isFinite(day) &&
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isValidDate) {
    return { valid: false, message: "Enter a real calendar date." };
  }

  return { valid: true, message: "" };
}

export function validateCustomReminderDateTime(value: string) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return { valid: false, message: "Choose a reminder date and time." };
  }

  const match = DATE_TIME_LOCAL_PATTERN.exec(trimmed);
  if (!match) {
    return { valid: false, message: "Use a valid date and time." };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);

  const isValidDateTime =
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute;

  if (!isValidDateTime) {
    return { valid: false, message: "Use a valid date and time." };
  }

  return { valid: true, message: "" };
}

export function createDefaultReminder(
  dueDate: string,
): AssessmentReminder | null {
  if (!hasDueDate(dueDate)) {
    return null;
  }

  return { mode: ASSESSMENT_REMINDER_MODE.DAY_BEFORE };
}

export function normalizeReminder(
  dueDate: string,
  reminder: unknown,
): AssessmentReminder | null {
  if (!hasDueDate(dueDate)) {
    return null;
  }

  if (!isReminderRecord(reminder)) {
    return createDefaultReminder(dueDate);
  }

  const mode = reminder.mode;
  if (!ASSESSMENT_REMINDER_MODES.includes(mode)) {
    return createDefaultReminder(dueDate);
  }

  if (mode !== ASSESSMENT_REMINDER_MODE.CUSTOM) {
    return { mode };
  }

  const customDateTime =
    typeof reminder.customDateTime === "string"
      ? reminder.customDateTime.trim()
      : "";

  return validateCustomReminderDateTime(customDateTime).valid
    ? { mode, customDateTime }
    : createDefaultReminder(dueDate);
}

export function sanitizeReminder(
  dueDate: string,
  reminder: AssessmentReminder | null | undefined,
) {
  return normalizeReminder(dueDate, reminder);
}

export function getReminderModeLabel(mode: AssessmentReminderMode) {
  switch (mode) {
    case ASSESSMENT_REMINDER_MODE.OFF:
      return "Off";
    case ASSESSMENT_REMINDER_MODE.DAY_BEFORE:
      return "Day before";
    case ASSESSMENT_REMINDER_MODE.MORNING_OF:
      return "Morning of";
    case ASSESSMENT_REMINDER_MODE.CUSTOM:
      return "Custom date and time";
  }
}

function isReminderRecord(
  value: unknown,
): value is { mode: AssessmentReminderMode; customDateTime?: unknown } {
  return typeof value === "object" && value !== null && "mode" in value;
}
