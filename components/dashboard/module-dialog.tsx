"use client";

import { ReactNode, SyntheticEvent, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Module } from "@/lib/types";

const defaultGradeBands = [
  { id: "grade-band-a", label: "A", threshold: 80 },
  { id: "grade-band-b", label: "B", threshold: 70 },
  { id: "grade-band-c", label: "C", threshold: 60 },
  { id: "grade-band-d", label: "D", threshold: 50 },
];

interface ModuleDialogProps {
  onSaveModule: (module: Module) => void;
  triggerLabel?: string;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost";
  module?: Module;
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function ModuleDialog({
  onSaveModule,
  triggerLabel = "Add module",
  triggerVariant = "default",
  module,
  triggerAsChild = false,
  triggerChildren,
}: ModuleDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: module?.code ?? "",
    name: module?.name ?? "",
    instructor: module?.instructor ?? "",
    credits: String(module?.credits ?? 12),
  });

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    const nextModule: Module = {
      id: module?.id ?? crypto.randomUUID(),
      code: form.code.toUpperCase(),
      name: form.name,
      instructor: form.instructor,
      credits: Number(form.credits),
      accent: module?.accent ?? "from-stone-950 via-stone-900 to-stone-700",
      gradeBands:
        module?.gradeBands ??
        defaultGradeBands.map((band) => ({
          ...band,
          id: `${form.code.toLowerCase() || "module"}-${band.id}`,
        })),
      assessments: module?.assessments ?? [],
    };

    onSaveModule(nextModule);
    setForm({
      code: module?.code ?? "",
      name: module?.name ?? "",
      instructor: module?.instructor ?? "",
      credits: String(module?.credits ?? 12),
    });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{module ? "Edit module" : "Add module"}</DialogTitle>
          <DialogDescription>
            {module ? "Update module details." : "Create a module."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="module-code">Module code</Label>
              <Input
                id="module-code"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value.toUpperCase().slice(0, 7),
                  }))
                }
                maxLength={7}
                placeholder="ECO214"
                required
                value={form.code}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-credits">Credits</Label>
              <Input
                id="module-credits"
                min={1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    credits: event.target.value,
                  }))
                }
                required
                type="number"
                value={form.credits}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="module-name">Module title</Label>
            <Input
              id="module-name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Behavioral Economics"
              required
              value={form.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="module-instructor">Lecturer</Label>
            <Input
              id="module-instructor"
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
          <DialogFooter>
            <Button type="submit">
              {module ? "Save changes" : "Create module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
