"use client";

import { ReactNode, SyntheticEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
  getGroupedAssessmentDefinition,
} from "@/lib/grouped-assessment-utils";
import { GroupedAssessment, GroupedAssessmentCategory } from "@/lib/types";

interface GroupedAssessmentDialogProps {
  moduleId: string;
  category?: GroupedAssessmentCategory;
  assessment?: GroupedAssessment;
  onDeleteAssessment?: (moduleId: string, assessmentId: string) => void;
  onSaveAssessment: (moduleId: string, assessment: GroupedAssessment) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost";
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
  const definition = getGroupedAssessmentDefinition(
    assessment?.category ?? category,
  );
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const [form, setForm] = useState(
    assessment
      ? getGroupedAssessmentEditorValue(assessment)
      : getGroupedAssessmentDefaults(category),
  );

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
            {assessment
              ? `Edit ${definition.label}`
              : `Create ${definition.label}`}
          </DialogTitle>
          <DialogDescription>Grouped category assessment</DialogDescription>
        </DialogHeader>
        <form className="flex min-h-0 flex-1 flex-col gap-5" onSubmit={submit}>
          <GroupedAssessmentEditor
            category={assessment?.category ?? category}
            onChange={setForm}
            value={form}
          />
          <DialogFooter className="items-center justify-between border-t border-stone-200 bg-[#f7f4ee]/95 pt-4 sm:flex-row">
            {assessment && onDeleteAssessment ? (
              <Button
                className="w-full sm:w-auto"
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
            <Button type="submit">
              {assessment ? "Save changes" : `Create ${definition.label}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
