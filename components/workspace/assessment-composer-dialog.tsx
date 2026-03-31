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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GroupedAssessmentEditor } from "@/components/workspace/grouped-assessment-editor";
import {
  buildGroupedAssessment,
  getGroupedAssessmentDefaults,
} from "@/lib/grouped-assessment-utils";
import { sanitizePlainNumberInput } from "@/lib/numeric-input";
import { Assessment, Module, SingleAssessment } from "@/lib/types";

interface AssessmentComposerDialogProps {
  module: Module;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
  triggerLabel?: string;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost";
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

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    if (mode === "single") {
      const nextAssessment: SingleAssessment = {
        id: crypto.randomUUID(),
        kind: "single",
        name: singleForm.name,
        weight: Number(singleForm.weight),
        scoreAchieved: null,
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
      {triggerChildren ? (
        <DialogTrigger asChild={triggerAsChild}>
          {triggerChildren}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant={triggerVariant}>{triggerLabel}</Button>
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[92vh] w-[min(94vw,640px)] flex-col overflow-hidden rounded-[28px] p-4 sm:max-w-4xl sm:rounded-[32px] sm:p-6">
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
              <div className="grid gap-4 rounded-[20px] border border-stone-200 bg-white p-3.5 sm:rounded-[28px] sm:p-4">
                <div className="space-y-2">
                  <Label htmlFor="single-name">Assignment name</Label>
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
                    <Label htmlFor="single-weight">Weight (%)</Label>
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

          <DialogFooter className="shrink-0 border-t border-stone-200 bg-[#f7f4ee]/95 pt-3">
            <Button className="w-full sm:w-auto" type="submit">
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
    <button
      className={`rounded-[20px] border px-3 py-3 text-left transition sm:rounded-[24px] sm:px-4 sm:py-4 ${
        isActive
          ? "border-stone-950 bg-stone-950 text-stone-50"
          : "border-stone-200 bg-white text-stone-950 hover:border-stone-300 hover:bg-stone-50/60"
      }`}
      onClick={onClick}
      type="button"
    >
      <p className="text-[0.9rem] font-semibold leading-5 sm:text-sm">
        {title}
      </p>
      <p
        className={`mt-1 text-[0.8rem] leading-5 sm:text-sm ${
          isActive ? "text-stone-300" : "text-stone-600"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

function getDefaultSingleForm() {
  return {
    name: "",
    weight: "20",
    dueDate: "",
  };
}
