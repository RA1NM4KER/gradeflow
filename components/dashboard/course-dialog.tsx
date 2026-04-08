"use client";

import { ReactNode, SyntheticEvent, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DialogTriggerAction } from "@/components/ui/dialog-trigger-action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  getInitialFormState,
  getInitialGradeBands,
  selectableCourseThemeOptions,
} from "@/components/dashboard/course-dialog-helpers";
import { GradeBandEditorSection } from "@/components/workspace/grades/grade-band-editor-section";
import { sanitizeIntegerInput } from "@/lib/assessments/numeric-input";
import { cn } from "@/lib/shared/utils";
import { Course, GradeBand, Semester } from "@/lib/shared/types";
import { ensureUuid, createUuid } from "@/lib/shared/uuid";

interface CourseDialogProps {
  onSaveCourse: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onMoveCourse?: (courseId: string, targetSemesterId: string) => void;
  currentSemesterId?: string;
  availableSemesters?: Pick<Semester, "id" | "name" | "periodLabel">[];
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  course?: Course;
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function CourseDialog({
  onSaveCourse,
  onDeleteCourse,
  onMoveCourse,
  currentSemesterId,
  availableSemesters = [],
  triggerLabel = "Add course",
  triggerVariant = "default",
  course,
  triggerAsChild = false,
  triggerChildren,
}: CourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isMoveSectionOpen, setIsMoveSectionOpen] = useState(false);
  const [form, setForm] = useState(() => getInitialFormState(course));
  const [gradeBands, setGradeBands] = useState<GradeBand[]>(() =>
    getInitialGradeBands(course),
  );
  const [moveTargetSemesterId, setMoveTargetSemesterId] = useState(
    currentSemesterId ?? "",
  );
  const usesStepper = !course;
  const showsCutoffEditor = !course;
  const movableSemesters = availableSemesters.filter(
    (semester) => semester.id !== currentSemesterId,
  );
  const canMoveCourse = Boolean(
    course &&
    onMoveCourse &&
    currentSemesterId &&
    moveTargetSemesterId &&
    moveTargetSemesterId !== currentSemesterId,
  );

  function resetDialogState(targetCourse?: Course) {
    setStep(1);
    setIsMoveSectionOpen(false);
    setMoveTargetSemesterId(currentSemesterId ?? "");
    setForm(getInitialFormState(targetCourse));
    setGradeBands(getInitialGradeBands(targetCourse));
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      resetDialogState(course);
    }
  }

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    if (usesStepper && step === 1) {
      setStep(2);
      return;
    }

    const nextCourse: Course = {
      id: course?.id ?? createUuid(),
      code: form.code.toUpperCase(),
      name: form.name,
      instructor: form.instructor,
      credits: Number(form.credits),
      accent: form.accent,
      gradeBands: gradeBands.map((band) => ({
        ...band,
        id: ensureUuid(band.id),
      })),
      assessments: course?.assessments ?? [],
    };

    onSaveCourse(nextCourse);
    setOpen(false);
  }

  function handleDeleteCourse() {
    if (!course || !onDeleteCourse) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${course.name} and all its assessments? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    onDeleteCourse(course.id);
    setOpen(false);
  }

  function handleMoveCourse() {
    if (!course || !onMoveCourse || !currentSemesterId || !canMoveCourse) {
      return;
    }

    const targetSemester = availableSemesters.find(
      (semester) => semester.id === moveTargetSemesterId,
    );
    const targetLabel = targetSemester?.name ?? "the selected semester";
    const confirmed = window.confirm(
      `Move ${course.name} to ${targetLabel}? All assessments and cutoffs will move too.`,
    );

    if (!confirmed) {
      return;
    }

    onMoveCourse(course.id, moveTargetSemesterId);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTriggerAction
        asChild={triggerAsChild}
        fallback={<Button variant={triggerVariant}>{triggerLabel}</Button>}
      >
        {triggerChildren}
      </DialogTriggerAction>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{course ? "Edit course" : "Add course"}</DialogTitle>
          <DialogDescription>
            {!showsCutoffEditor
              ? "Update course details."
              : !usesStepper
                ? "Update course details and cutoffs."
                : step === 1
                  ? "Step 1 of 2. Create a course."
                  : "Step 2 of 2. Choose and tune your cutoffs."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          {usesStepper && showsCutoffEditor ? (
            <div className="flex items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  step >= 1 ? "bg-primary" : "bg-line"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  step >= 2 ? "bg-primary" : "bg-line"
                }`}
              />
            </div>
          ) : null}
          {!usesStepper || step === 1 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course-code">Course code *</Label>
                  <Input
                    id="course-code"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        code: event.target.value.toUpperCase().slice(0, 8),
                      }))
                    }
                    maxLength={8}
                    placeholder="ECO214"
                    required
                    value={form.code}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-credits">Credits *</Label>
                  <Input
                    id="course-credits"
                    min={1}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        credits: sanitizeIntegerInput(event.target.value),
                      }))
                    }
                    required
                    inputMode="numeric"
                    type="text"
                    value={form.credits}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-name">Course title *</Label>
                <Input
                  id="course-name"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Behavioral Economics"
                  required
                  value={form.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-instructor">Lecturer *</Label>
                <Input
                  id="course-instructor"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      instructor: event.target.value,
                    }))
                  }
                  placeholder="Dr. Maya Patel"
                  required
                  value={form.instructor}
                />
              </div>
              <div className="space-y-2">
                <Label>Course color</Label>
                <div className="flex flex-wrap gap-2.5">
                  {selectableCourseThemeOptions.map((theme) => {
                    const isSelected = form.accent === theme.id;

                    return (
                      <button
                        className={cn(
                          "relative rounded-full border bg-surface p-1 transition",
                          isSelected
                            ? "border-line-strong shadow-[0_10px_24px_rgba(28,25,23,0.12)]"
                            : "border-line hover:border-line-strong hover:bg-surface-muted/70",
                        )}
                        aria-label={`${theme.name} course color`}
                        key={theme.id}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            accent: theme.id,
                          }))
                        }
                        type="button"
                      >
                        <span
                          className={cn(
                            "block h-8 w-8 rounded-full border border-surface/70 shadow-inner",
                            theme.band,
                          )}
                        />
                        {isSelected ? (
                          <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <GradeBandEditorSection
              bands={gradeBands}
              description="Choose the grade bands you want to track for this course, then tune their cutoffs."
              onChange={setGradeBands}
              title="Grade bands"
            />
          )}
          {!usesStepper && showsCutoffEditor ? (
            <GradeBandEditorSection
              bands={gradeBands}
              description="Choose the grade bands you want to track for this course, then tune their cutoffs."
              onChange={setGradeBands}
              title="Grade bands"
            />
          ) : null}
          {course &&
          onMoveCourse &&
          currentSemesterId &&
          movableSemesters.length > 0 ? (
            <Card className="rounded-[24px]" variant="surface-panel">
              <CardContent className="p-3.5 sm:p-4">
                <button
                  aria-expanded={isMoveSectionOpen}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  onClick={() => setIsMoveSectionOpen((current) => !current)}
                  type="button"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Move course
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      Transfer this course to another semester.
                    </p>
                  </div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink-soft">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isMoveSectionOpen ? "rotate-180" : "",
                      )}
                    />
                  </span>
                </button>

                {isMoveSectionOpen ? (
                  <div className="mt-4 space-y-3 border-t border-line/80 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="move-course-semester">
                        Destination semester
                      </Label>
                      <Select
                        id="move-course-semester"
                        onChange={(event) =>
                          setMoveTargetSemesterId(event.target.value)
                        }
                        value={moveTargetSemesterId}
                      >
                        <option value={currentSemesterId}>
                          Select a semester
                        </option>
                        {movableSemesters.map((semester) => (
                          <option key={semester.id} value={semester.id}>
                            {semester.name}
                            {semester.periodLabel
                              ? ` · ${semester.periodLabel}`
                              : ""}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <p className="text-xs text-ink-soft">
                      All assessments, cutoffs, and course details will move
                      with it.
                    </p>
                    <div className="flex justify-start">
                      <Button
                        disabled={!canMoveCourse}
                        onClick={handleMoveCourse}
                        type="button"
                        variant="destructive-soft"
                      >
                        Move course
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
          <DialogFooter className="sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {course ? (
                <Button
                  onClick={handleDeleteCourse}
                  type="button"
                  variant="destructive-soft"
                >
                  Delete course
                </Button>
              ) : null}
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              {usesStepper && showsCutoffEditor && step === 2 ? (
                <Button
                  onClick={() => setStep(1)}
                  type="button"
                  variant="outline"
                >
                  Back
                </Button>
              ) : null}
              <Button type="submit">
                {usesStepper && showsCutoffEditor && step === 1
                  ? "Next"
                  : course
                    ? "Save changes"
                    : "Create course"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
