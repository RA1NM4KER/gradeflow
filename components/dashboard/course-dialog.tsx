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
import { Course } from "@/lib/types";

interface CourseDialogProps {
  onCreateCourse: (course: Course) => void;
}

export function CourseDialog({ onCreateCourse }: CourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    instructor: "",
    credits: "12",
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const course: Course = {
      id: crypto.randomUUID(),
      code: form.code.toUpperCase(),
      name: form.name,
      instructor: form.instructor,
      credits: Number(form.credits),
      accent: "from-stone-950 via-stone-900 to-stone-700",
      assessments: [],
    };

    onCreateCourse(course);
    setForm({ code: "", name: "", instructor: "", credits: "12" });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add course</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new course</DialogTitle>
          <DialogDescription>
            Set up the module shell now and layer in assessments when you have
            the brief.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course-code">Course code</Label>
              <Input
                id="course-code"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value,
                  }))
                }
                placeholder="ECO214"
                required
                value={form.code}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-credits">Credits</Label>
              <Input
                id="course-credits"
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
            <Label htmlFor="course-name">Course title</Label>
            <Input
              id="course-name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Behavioral Economics"
              required
              value={form.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-instructor">Instructor</Label>
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
          <DialogFooter>
            <Button type="submit">Create course</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
