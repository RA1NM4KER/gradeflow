"use client";

import { ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTriggerAction } from "@/components/ui/dialog-trigger-action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssignmentReminderFields } from "@/components/workspace/assessments/assignment-reminder-fields";
import { parseOptionalPercent } from "@/lib/assessments/assessment-form-utils";
import {
  createDefaultReminder,
  normalizeReminder,
  validateCustomReminderDateTime,
  validateDueDate,
} from "@/lib/assessments/reminder-utils";
import {
  formatEditablePercent,
  parsePercentInput,
} from "@/lib/grades/grade-utils";
import { ASSESSMENT_REMINDER_MODE } from "@/lib/assessments/types";
import {
  sanitizePlainNumberInput,
  sanitizeScoreExpressionInput,
} from "@/lib/assessments/numeric-input";
import { SingleAssessment } from "@/lib/shared/types";

interface SingleAssessmentDialogProps {
  assessment: SingleAssessment;
  moduleId: string;
  onDeleteAssessment: (courseId: string, assessmentId: string) => void;
  onSaveAssessment: (moduleId: string, assessment: SingleAssessment) => void;
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function SingleAssessmentDialog({
  assessment,
  moduleId,
  onDeleteAssessment,
  onSaveAssessment,
  triggerAsChild = false,
  triggerChildren,
}: SingleAssessmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(getFormState(assessment));
  const [dueDateError, setDueDateError] = useState("");
  const [customReminderError, setCustomReminderError] = useState("");
  const isSubmitEnabled =
    form.name.trim().length > 0 && Number(form.weight || 0) > 0;
  const useTextDateInput = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(pointer: coarse)").matches;
  }, []);

  useEffect(() => {
    if (open) {
      setForm(getFormState(assessment));
      setDueDateError("");
      setCustomReminderError("");
    }
  }, [assessment, open]);

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    const dueDateValidation = validateDueDate(form.dueDate);
    if (!dueDateValidation.valid) {
      setDueDateError(dueDateValidation.message);
      return;
    }

    if (form.dueDate && form.reminderMode === ASSESSMENT_REMINDER_MODE.CUSTOM) {
      const customReminderValidation = validateCustomReminderDateTime(
        form.customReminderDateTime,
      );
      if (!customReminderValidation.valid) {
        setCustomReminderError(customReminderValidation.message);
        return;
      }
    }

    const parsedGrade = parsePercentInput(form.grade);

    onSaveAssessment(moduleId, {
      ...assessment,
      name: form.name,
      weight: Number(form.weight || 0),
      dueDate: form.dueDate,
      scoreAchieved: parsedGrade,
      subminimumPercent: parseOptionalPercent(form.subminimumPercent),
      totalPossible: 100,
      status: parsedGrade === null ? "ongoing" : "completed",
      reminder: !form.dueDate
        ? null
        : form.reminderMode === ASSESSMENT_REMINDER_MODE.CUSTOM
          ? {
              mode: ASSESSMENT_REMINDER_MODE.CUSTOM,
              customDateTime: form.customReminderDateTime,
            }
          : {
              mode: form.reminderMode,
            },
    });

    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTriggerAction asChild={triggerAsChild}>
        {triggerChildren}
      </DialogTriggerAction>
      <DialogContent
        layout="workspace-compact"
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit assignment</DialogTitle>
          <DialogDescription>{assessment.name}</DialogDescription>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={submit}
        >
          <div className="grid min-h-0 content-start gap-4 overflow-y-auto pr-1 pb-4">
            <div className="space-y-2">
              <Label htmlFor={`assignment-name-${assessment.id}`}>
                Assignment name *
              </Label>
              <Input
                id={`assignment-name-${assessment.id}`}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                value={form.name}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`assignment-weight-${assessment.id}`}>
                  Weight (%) *
                </Label>
                <Input
                  id={`assignment-weight-${assessment.id}`}
                  inputMode="decimal"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      weight: sanitizePlainNumberInput(event.target.value),
                    }))
                  }
                  type="text"
                  value={form.weight}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`assignment-subminimum-${assessment.id}`}>
                  Subminimum (%) optional
                </Label>
                <Input
                  id={`assignment-subminimum-${assessment.id}`}
                  inputMode="decimal"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subminimumPercent: sanitizePlainNumberInput(
                        event.target.value,
                      ),
                    }))
                  }
                  placeholder="e.g. 45"
                  type="text"
                  value={form.subminimumPercent}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`assignment-grade-${assessment.id}`}>
                  Grade
                </Label>
                <Input
                  id={`assignment-grade-${assessment.id}`}
                  inputMode="decimal"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      grade: sanitizeScoreExpressionInput(event.target.value),
                    }))
                  }
                  placeholder="e.g. 50, 1/2, 75%"
                  type="text"
                  value={form.grade}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`assignment-due-date-${assessment.id}`}>
                  Due date
                </Label>
                <Input
                  id={`assignment-due-date-${assessment.id}`}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }));
                    setDueDateError("");
                  }}
                  inputMode={useTextDateInput ? "numeric" : undefined}
                  placeholder={useTextDateInput ? "YYYY-MM-DD" : "Optional"}
                  type={useTextDateInput ? "text" : "date"}
                  value={form.dueDate}
                />
                {dueDateError ? (
                  <p className="text-xs text-danger">{dueDateError}</p>
                ) : null}
              </div>
              <AssignmentReminderFields
                customDateTime={form.customReminderDateTime}
                customDateTimeError={customReminderError}
                dueDate={form.dueDate}
                mode={form.reminderMode}
                onCustomDateTimeChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    customReminderDateTime: value,
                  }));
                  setCustomReminderError("");
                }}
                onModeChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    reminderMode: value,
                    customReminderDateTime:
                      value === ASSESSMENT_REMINDER_MODE.CUSTOM
                        ? current.customReminderDateTime
                        : "",
                  }));
                  setCustomReminderError("");
                }}
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 items-center justify-between pt-3 sm:flex-row">
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete ${assessment.name}? This cannot be undone.`,
                  )
                ) {
                  onDeleteAssessment(moduleId, assessment.id);
                  setOpen(false);
                }
              }}
              type="button"
              variant="destructive-soft"
            >
              Delete assignment
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={!isSubmitEnabled}
              type="submit"
              variant={isSubmitEnabled ? "dialog-primary" : "dialog-muted"}
            >
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getFormState(assessment: SingleAssessment) {
  const reminder = normalizeReminder(assessment.dueDate, assessment.reminder);

  return {
    name: assessment.name,
    weight: String(assessment.weight),
    grade:
      assessment.scoreAchieved === null
        ? ""
        : formatEditablePercent(
            assessment.scoreAchieved,
            assessment.totalPossible,
          ),
    subminimumPercent:
      assessment.subminimumPercent === null
        ? ""
        : String(assessment.subminimumPercent),
    dueDate: assessment.dueDate || "",
    reminderMode:
      reminder?.mode ??
      createDefaultReminder(assessment.dueDate)?.mode ??
      ASSESSMENT_REMINDER_MODE.DAY_BEFORE,
    customReminderDateTime:
      reminder && reminder.mode === ASSESSMENT_REMINDER_MODE.CUSTOM
        ? (reminder.customDateTime ?? "")
        : "",
  };
}
