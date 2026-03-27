"use client";

import { FormEvent, useState } from "react";

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
import { Assessment, Course } from "@/lib/types";

interface AssessmentDialogProps {
  course: Course;
  onCreateAssessment: (courseId: string, assessment: Assessment) => void;
}

export function AssessmentDialog({
  course,
  onCreateAssessment,
}: AssessmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    weight: "20",
    totalPossible: "100",
    dueDate: "",
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const assessment: Assessment = {
      id: crypto.randomUUID(),
      name: form.name,
      weight: Number(form.weight),
      scoreAchieved: null,
      totalPossible: Number(form.totalPossible),
      dueDate: form.dueDate,
      category: "assignment",
      status: "ongoing",
    };

    onCreateAssessment(course.id, assessment);
    setForm({ name: "", weight: "20", totalPossible: "100", dueDate: "" });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add assessment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an assessment</DialogTitle>
          <DialogDescription>
            Attach a new grading checkpoint to {course.code} and keep the
            weighting explicit.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="assessment-name">Assessment name</Label>
            <Input
              id="assessment-name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Midterm Essay"
              required
              value={form.name}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="assessment-weight">Weight (%)</Label>
              <Input
                id="assessment-weight"
                max={100}
                min={1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    weight: event.target.value,
                  }))
                }
                required
                type="number"
                value={form.weight}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessment-total">Total points</Label>
              <Input
                id="assessment-total"
                min={1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    totalPossible: event.target.value,
                  }))
                }
                required
                type="number"
                value={form.totalPossible}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessment-date">Due label</Label>
              <Input
                id="assessment-date"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    dueDate: event.target.value,
                  }))
                }
                placeholder="May 14"
                required
                value={form.dueDate}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save assessment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
