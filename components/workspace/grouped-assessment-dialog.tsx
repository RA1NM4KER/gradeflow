"use client";

import { ReactNode, SyntheticEvent, useEffect, useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getGroupedAssessmentEditorValue,
  GroupedAssessmentEditor,
} from "@/components/workspace/grouped-assessment-editor";
import {
  buildGroupedAssessment,
  getGroupedAssessmentDefaults,
} from "@/lib/grouped-assessment-utils";
import { GroupedAssessment, GroupedAssessmentCategory } from "@/lib/types";

const dialogPrimaryButtonClassName =
  "border border-stone-300/80 bg-stone-900 text-white shadow-[0_12px_28px_-16px_rgba(15,23,42,0.4)] hover:bg-stone-800 dark:border-white/14 dark:bg-white/18 dark:text-white dark:hover:bg-white/24";

interface GroupedAssessmentDialogProps {
  moduleId: string;
  category?: GroupedAssessmentCategory;
  assessment?: GroupedAssessment;
  onDeleteAssessment?: (moduleId: string, assessmentId: string) => void;
  onSaveAssessment: (moduleId: string, assessment: GroupedAssessment) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function GroupedAssessmentDialog({
  moduleId,
  category = "tutorials",
  assessment,
  onDeleteAssessment,
  onSaveAssessment,
  open,
  onOpenChange,
  triggerLabel = "Add grouped category",
  triggerVariant = "outline",
  triggerAsChild = false,
  triggerChildren,
}: GroupedAssessmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const [form, setForm] = useState(
    assessment
      ? getGroupedAssessmentEditorValue(assessment)
      : getGroupedAssessmentDefaults(category),
  );
  const isSubmitEnabled =
    form.name.trim().length > 0 &&
    Number(form.weight || 0) > 0 &&
    form.itemCount > 0;

  useEffect(() => {
    if (dialogOpen) {
      setForm(
        assessment
          ? getGroupedAssessmentEditorValue(assessment)
          : getGroupedAssessmentDefaults(category),
      );
    }
  }, [assessment, category, dialogOpen]);

  function setDialogOpen(nextOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    onSaveAssessment(
      moduleId,
      buildGroupedAssessment(assessment?.category ?? category, {
        id: assessment?.id,
        name: form.name,
        weight: Number(form.weight || 0),
        itemCount: form.itemCount,
        dropLowest: form.dropLowest,
        items: form.items,
      }),
    );

    setDialogOpen(false);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {triggerChildren ? (
        <DialogTrigger asChild={triggerAsChild}>
          {triggerChildren}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant={triggerVariant}>{triggerLabel}</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {assessment ? "Edit category" : "Create category"}
          </DialogTitle>
          <DialogDescription>
            {assessment
              ? "Update the category name, weighting, and included items."
              : "Create one weighted category containing smaller marks."}
          </DialogDescription>
        </DialogHeader>
        <form className="flex min-h-0 flex-1 flex-col gap-5" onSubmit={submit}>
          <GroupedAssessmentEditor
            category={assessment?.category ?? category}
            onChange={setForm}
            value={form}
          />
          <DialogFooter className="grid grid-cols-2 gap-2 pt-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
            {assessment && onDeleteAssessment ? (
              <Button
                className="w-full min-w-0 border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100 sm:w-auto"
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete ${assessment.name}? This cannot be undone.`,
                    )
                  ) {
                    onDeleteAssessment(moduleId, assessment.id);
                    setDialogOpen(false);
                  }
                }}
                type="button"
                variant="outline"
              >
                Delete category
              </Button>
            ) : (
              <span />
            )}
            <Button
              className={`w-full min-w-0 px-3 sm:w-auto ${
                isSubmitEnabled
                  ? dialogPrimaryButtonClassName
                  : "border border-white/20 bg-white/40 text-ink-muted shadow-[0_10px_24px_rgba(28,25,23,0.04)] backdrop-blur-sm hover:bg-white/40 dark:border-white/10 dark:bg-white/5 dark:text-ink-muted dark:hover:bg-white/5"
              }`}
              disabled={!isSubmitEnabled}
              type="submit"
            >
              {assessment ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
