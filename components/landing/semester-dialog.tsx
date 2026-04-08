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
} from "@/components/ui/dialog";
import { DialogTriggerAction } from "@/components/ui/dialog-trigger-action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSemester } from "@/lib/course/semester-utils";
import { Semester } from "@/lib/shared/types";

interface SemesterDialogProps {
  onSaveSemester: (semester: Semester) => void;
  semester?: Semester;
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function SemesterDialog({
  onSaveSemester,
  semester,
  triggerAsChild = false,
  triggerChildren,
}: SemesterDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: semester?.name ?? "",
    periodLabel: semester?.periodLabel ?? "",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      name: semester?.name ?? "",
      periodLabel: semester?.periodLabel ?? "",
    });
  }, [open, semester]);

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    onSaveSemester(
      semester
        ? {
            ...semester,
            name: form.name,
            periodLabel: form.periodLabel,
          }
        : createSemester({
            name: form.name,
            periodLabel: form.periodLabel,
          }),
    );

    setForm({
      name: semester?.name ?? "",
      periodLabel: semester?.periodLabel ?? "",
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerAction
        asChild={triggerAsChild}
        fallback={<Button size="lg">Create semester</Button>}
      >
        {triggerChildren}
      </DialogTriggerAction>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {semester ? "Edit semester" : "Create semester"}
          </DialogTitle>
          <DialogDescription>
            {semester
              ? "Update this semester."
              : "Start a new semester, then add courses inside it."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="semester-name">Semester name</Label>
            <Input
              id="semester-name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Semester 1 2026"
              required
              value={form.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester-period">Period label</Label>
            <Input
              id="semester-period"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  periodLabel: event.target.value,
                }))
              }
              placeholder="January to June"
              required
              value={form.periodLabel}
            />
          </div>
          <DialogFooter>
            <Button type="submit">
              {semester ? "Save changes" : "Create semester"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
