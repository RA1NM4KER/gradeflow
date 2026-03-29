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
        dueDate: "",
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
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add assignment</DialogTitle>
          <DialogDescription>{module.code}</DialogDescription>
        </DialogHeader>
        <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-3 sm:grid-cols-2">
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
            <div className="grid gap-4 rounded-[28px] border border-stone-200 bg-white p-4">
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
                        weight: event.target.value,
                      }))
                    }
                    required
                    type="number"
                    value={singleForm.weight}
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

          <DialogFooter>
            <Button type="submit">
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
      className={`rounded-[24px] border px-4 py-4 text-left transition ${
        isActive
          ? "border-stone-950 bg-stone-950 text-stone-50"
          : "border-stone-200 bg-stone-50/70 text-stone-950 hover:border-stone-300"
      }`}
      onClick={onClick}
      type="button"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p
        className={`mt-1 text-sm ${
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
  };
}
