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
} from "@/components/ui/dialog";
import { DialogTriggerAction } from "@/components/ui/dialog-trigger-action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectableCardButton } from "@/components/ui/selectable-card-button";
import { GroupedAssessmentEditor } from "@/components/workspace/assessments/grouped-assessment-editor";
import { parseOptionalPercent } from "@/lib/assessments/assessment-form-utils";
import {
  buildGroupedAssessment,
  getGroupedAssessmentDefaults,
} from "@/lib/assessments/grouped-assessment-utils";
import { sanitizePlainNumberInput } from "@/lib/assessments/numeric-input";
import { Assessment, Module, SingleAssessment } from "@/lib/shared/types";
import { createUuid } from "@/lib/shared/uuid";

interface AssessmentComposerDialogProps {
  module: Module;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function AssessmentComposerDialog({
  module,
  onSaveAssessment,
  triggerLabel = "Add assignment",
  triggerVariant = "outline",
  triggerAsChild = false,
  triggerChildren,
}: AssessmentComposerDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "group">("single");
  const [singleForm, setSingleForm] = useState(getDefaultSingleForm());
  const [groupForm, setGroupForm] = useState(
    getGroupedAssessmentDefaults("tutorials"),
  );

  useEffect(() => {
    if (open) {
      setSingleForm(getDefaultSingleForm());
      setGroupForm(getGroupedAssessmentDefaults("tutorials"));
      setMode("single");
    }
  }, [open]);

  const isSingleValid =
    singleForm.name.trim().length > 0 && Number(singleForm.weight) > 0;
  const isGroupValid =
    groupForm.name.trim().length > 0 &&
    Number(groupForm.weight) > 0 &&
    groupForm.itemCount > 0;
  const isSubmitEnabled = mode === "single" ? isSingleValid : isGroupValid;

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    if (mode === "single") {
      const nextAssessment: SingleAssessment = {
        id: createUuid(),
        kind: "single",
        name: singleForm.name,
        weight: Number(singleForm.weight),
        scoreAchieved: null,
        subminimumPercent: parseOptionalPercent(singleForm.subminimumPercent),
        totalPossible: 100,
        dueDate: singleForm.dueDate,
        category: "assignment",
        status: "ongoing",
      };

      onSaveAssessment(module.id, nextAssessment);
    } else {
      onSaveAssessment(
        module.id,
        buildGroupedAssessment("tutorials", {
          name: groupForm.name,
          weight: Number(groupForm.weight || 0),
          itemCount: groupForm.itemCount,
          dropLowest: groupForm.dropLowest,
          items: groupForm.items,
        }),
      );
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerAction
        asChild={triggerAsChild}
        fallback={<Button variant={triggerVariant}>{triggerLabel}</Button>}
      >
        {triggerChildren}
      </DialogTriggerAction>
      <DialogContent layout="workspace-wide">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add assignment</DialogTitle>
          <DialogDescription>{module.code}</DialogDescription>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={submit}
        >
          <div className="grid min-h-0 content-start gap-4 overflow-y-auto pr-1 pb-4 sm:gap-5">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <ModeCard
                description="Create a single weighted assignment with one score."
                isActive={mode === "single"}
                onClick={() => setMode("single")}
                title="Single assignment"
              />
              <ModeCard
                description="Create one weighted category containing smaller marks."
                isActive={mode === "group"}
                onClick={() => setMode("group")}
                title="Grouped category"
              />
            </div>

            {mode === "single" ? (
              <div className="grid gap-4 rounded-[20px] border border-white/28 bg-white/42 p-3.5 backdrop-blur-sm sm:rounded-[28px] sm:p-4 dark:border-white/10 dark:bg-white/5">
                <div className="space-y-2">
                  <Label htmlFor="single-name">Assignment name *</Label>
                  <Input
                    id="single-name"
                    onChange={(event) =>
                      setSingleForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                    value={singleForm.name}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="single-weight">Weight (%) *</Label>
                    <Input
                      id="single-weight"
                      min={0}
                      onChange={(event) =>
                        setSingleForm((current) => ({
                          ...current,
                          weight: sanitizePlainNumberInput(event.target.value),
                        }))
                      }
                      required
                      inputMode="decimal"
                      type="text"
                      value={singleForm.weight}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="single-subminimum">
                      Subminimum (%) optional
                    </Label>
                    <Input
                      id="single-subminimum"
                      inputMode="decimal"
                      onChange={(event) =>
                        setSingleForm((current) => ({
                          ...current,
                          subminimumPercent: sanitizePlainNumberInput(
                            event.target.value,
                          ),
                        }))
                      }
                      placeholder="e.g. 45"
                      type="text"
                      value={singleForm.subminimumPercent}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="single-due-date">Due date</Label>
                    <Input
                      id="single-due-date"
                      onChange={(event) =>
                        setSingleForm((current) => ({
                          ...current,
                          dueDate: event.target.value,
                        }))
                      }
                      type="date"
                      value={singleForm.dueDate}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <GroupedAssessmentEditor
                category="tutorials"
                onChange={setGroupForm}
                value={groupForm}
              />
            )}
          </div>

          <DialogFooter className="shrink-0 pt-3">
            <Button
              className="w-full sm:w-auto"
              disabled={!isSubmitEnabled}
              type="submit"
              variant={isSubmitEnabled ? "dialog-primary" : "dialog-muted"}
            >
              {mode === "single" ? "Save assignment" : "Create Tutorials"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ModeCard({
  title,
  description,
  isActive,
  onClick,
}: {
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <SelectableCardButton
      onClick={onClick}
      tone={isActive ? "active" : "inactive"}
    >
      <p className="text-[0.9rem] font-semibold leading-5 sm:text-sm">
        {title}
      </p>
      <p className="mt-1 text-[0.8rem] leading-5 text-ink-muted sm:text-sm">
        {description}
      </p>
    </SelectableCardButton>
  );
}

function getDefaultSingleForm() {
  return {
    name: "",
    weight: "20",
    subminimumPercent: "",
    dueDate: "",
  };
}
