"use client";

import { Input, inputVariants } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getReminderModeLabel,
  hasDueDate,
} from "@/lib/assessments/reminder-utils";
import {
  ASSESSMENT_REMINDER_MODES,
  AssessmentReminderMode,
} from "@/lib/assessments/types";
import { cn } from "@/lib/shared/utils";

interface AssignmentReminderFieldsProps {
  customDateTime: string;
  customDateTimeError?: string;
  dueDate: string;
  mode: AssessmentReminderMode;
  onCustomDateTimeChange: (value: string) => void;
  onModeChange: (value: AssessmentReminderMode) => void;
}

export function AssignmentReminderFields({
  customDateTime,
  customDateTimeError,
  dueDate,
  mode,
  onCustomDateTimeChange,
  onModeChange,
}: AssignmentReminderFieldsProps) {
  const dueDatePresent = hasDueDate(dueDate);

  return (
    <div className="space-y-2">
      <Label htmlFor="assignment-reminder-mode">Reminder</Label>
      {dueDatePresent ? (
        <>
          <select
            className={cn(
              inputVariants({ variant: "default" }),
              "appearance-none",
            )}
            id="assignment-reminder-mode"
            onChange={(event) =>
              onModeChange(event.target.value as AssessmentReminderMode)
            }
            value={mode}
          >
            {ASSESSMENT_REMINDER_MODES.map((option) => (
              <option key={option} value={option}>
                {getReminderModeLabel(option)}
              </option>
            ))}
          </select>
          {mode === "custom" ? (
            <div className="space-y-2">
              <Label htmlFor="assignment-reminder-custom">
                Custom reminder date and time
              </Label>
              <Input
                id="assignment-reminder-custom"
                onChange={(event) => onCustomDateTimeChange(event.target.value)}
                type="datetime-local"
                value={customDateTime}
              />
              {customDateTimeError ? (
                <p className="text-xs text-danger">{customDateTimeError}</p>
              ) : null}
            </div>
          ) : null}
          <p className="text-xs text-ink-subtle">
            Day before reminders go out at 6:00 PM. Morning reminders go out at
            8:00 AM on the due date.
          </p>
        </>
      ) : (
        <p className="text-xs text-ink-subtle">
          Add a due date to enable assignment reminders.
        </p>
      )}
    </div>
  );
}
