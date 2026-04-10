import { describe, expect, it } from "vitest";

import {
  createDefaultReminder,
  normalizeReminder,
  validateCustomReminderDateTime,
  validateDueDate,
} from "@/lib/assessments/reminder-utils";

describe("reminder-utils", () => {
  it("defaults due-dated assignments to a day-before reminder", () => {
    expect(createDefaultReminder("2026-04-30")).toEqual({
      mode: "day_before",
    });
    expect(normalizeReminder("2026-04-30", undefined)).toEqual({
      mode: "day_before",
    });
  });

  it("drops reminders when an assignment has no due date", () => {
    expect(createDefaultReminder("")).toBeNull();
    expect(
      normalizeReminder("", {
        mode: "custom",
        customDateTime: "2026-04-29T18:00",
      }),
    ).toBeNull();
  });

  it("keeps valid custom reminders and falls back when custom input is invalid", () => {
    expect(
      normalizeReminder("2026-04-30", {
        mode: "custom",
        customDateTime: "2026-04-29T18:00",
      }),
    ).toEqual({
      mode: "custom",
      customDateTime: "2026-04-29T18:00",
    });

    expect(
      normalizeReminder("2026-04-30", {
        mode: "custom",
        customDateTime: "bad-value",
      }),
    ).toEqual({
      mode: "day_before",
    });
  });

  it("validates due date and custom reminder inputs", () => {
    expect(validateDueDate("2026-04-30")).toEqual({
      valid: true,
      message: "",
    });
    expect(validateDueDate("2026-02-30")).toEqual({
      valid: false,
      message: "Enter a real calendar date.",
    });

    expect(validateCustomReminderDateTime("2026-04-29T18:00")).toEqual({
      valid: true,
      message: "",
    });
    expect(validateCustomReminderDateTime("2026-04-29 18:00")).toEqual({
      valid: false,
      message: "Use a valid date and time.",
    });
  });
});
