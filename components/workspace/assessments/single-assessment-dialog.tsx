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
import { parseOptionalPercent } from "@/lib/assessments/assessment-form-utils";
import {
  formatEditablePercent,
  parsePercentInput,
} from "@/lib/grades/grade-utils";
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
    }
  }, [assessment, open]);

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    const dueDateValidation = validateDueDate(form.dueDate);
    if (!dueDateValidation.valid) {
      setDueDateError(dueDateValidation.message);
      return;
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
  };
}

function validateDueDate(value: string) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return { valid: true, message: "" };
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return { valid: false, message: "Use YYYY-MM-DD." };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(`${trimmed}T00:00:00`);

  const isValidDate =
    Number.isFinite(year) &&
    Number.isFinite(month) &&
    Number.isFinite(day) &&
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day;

  if (!isValidDate) {
    return { valid: false, message: "Enter a real calendar date." };
  }

  return { valid: true, message: "" };
}
