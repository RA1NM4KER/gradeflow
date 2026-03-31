"use client";

import { ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";

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
import {
  GradeBandEditor,
  GRADE_BAND_PRESETS,
} from "@/components/workspace/grade-band-editor";
import { courseThemeOptions, getCourseTheme } from "@/lib/course-theme";
import { sanitizeIntegerInput } from "@/lib/numeric-input";
import { cn } from "@/lib/utils";
import { Course, GradeBand } from "@/lib/types";

const selectableCourseThemeOptions = courseThemeOptions.filter(
  (theme) => theme.id !== "violet",
);

interface CourseDialogProps {
  onSaveCourse: (course: Course) => void;
  triggerLabel?: string;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost";
  course?: Course;
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function CourseDialog({
  onSaveCourse,
  triggerLabel = "Add course",
  triggerVariant = "default",
  course,
  triggerAsChild = false,
  triggerChildren,
}: CourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState({
    code: course?.code ?? "",
    name: course?.name ?? "",
    instructor: course?.instructor ?? "",
    credits: String(course?.credits ?? 12),
    accent: getInitialCourseThemeId(course),
  });
  const [gradeBands, setGradeBands] = useState<GradeBand[]>(
    course?.gradeBands ?? getDefaultGradeBands(course?.code ?? ""),
  );
  const usesStepper = useMemo(() => !(course && isMobile), [course, isMobile]);
  const showsCutoffEditor = usesStepper || !course;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (open) {
      setStep(1);
      setForm({
        code: course?.code ?? "",
        name: course?.name ?? "",
        instructor: course?.instructor ?? "",
        credits: String(course?.credits ?? 12),
        accent: getInitialCourseThemeId(course),
      });
      setGradeBands(
        course?.gradeBands ?? getDefaultGradeBands(course?.code ?? ""),
      );
    }
  }, [course, open]);

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    if (usesStepper && step === 1) {
      setStep(2);
      return;
    }

    const nextCourse: Course = {
      id: course?.id ?? crypto.randomUUID(),
      code: form.code.toUpperCase(),
      name: form.name,
      instructor: form.instructor,
      credits: Number(form.credits),
      accent: form.accent,
      gradeBands: gradeBands.map((band) => ({
        ...band,
        id: `${(form.code || course?.code || "course").toLowerCase()}-${band.label.toLowerCase().replace(/[^a-z0-9+-]/g, "")}`,
      })),
      assessments: course?.assessments ?? [],
    };

    onSaveCourse(nextCourse);
    setForm({
      code: course?.code ?? "",
      name: course?.name ?? "",
      instructor: course?.instructor ?? "",
      credits: String(course?.credits ?? 12),
      accent: getInitialCourseThemeId(course),
    });
    setGradeBands(
      course?.gradeBands ?? getDefaultGradeBands(course?.code ?? ""),
    );
    setStep(1);
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
          <DialogTitle>{course ? "Edit course" : "Add course"}</DialogTitle>
          <DialogDescription>
            {!showsCutoffEditor
              ? "Update course details."
              : !usesStepper
                ? "Update course details and cutoffs."
                : step === 1
                  ? course
                    ? "Step 1 of 2. Update course details."
                    : "Step 1 of 2. Create a course."
                  : "Step 2 of 2. Choose and tune your cutoffs."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          {usesStepper && showsCutoffEditor ? (
            <div className="flex items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  step >= 1 ? "bg-stone-950" : "bg-stone-200"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  step >= 2 ? "bg-stone-950" : "bg-stone-200"
                }`}
              />
            </div>
          ) : null}
          {!usesStepper || step === 1 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course-code">Course code</Label>
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
                  <Label htmlFor="course-credits">Credits</Label>
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
                <Label htmlFor="course-name">Course title</Label>
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
                <Label htmlFor="course-instructor">Lecturer</Label>
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
                          "relative rounded-full border bg-white p-1 transition",
                          isSelected
                            ? "border-stone-400 shadow-[0_10px_24px_rgba(28,25,23,0.12)]"
                            : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/70",
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
                            "block h-8 w-8 rounded-full border border-white/70 shadow-inner",
                            theme.band,
                          )}
                        />
                        {isSelected ? (
                          <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-stone-950 text-white shadow-sm">
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
            <GradeBandEditor bands={gradeBands} onChange={setGradeBands} />
          )}
          {!usesStepper && showsCutoffEditor ? (
            <GradeBandEditor bands={gradeBands} onChange={setGradeBands} />
          ) : null}
          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function getDefaultGradeBands(courseCode: string) {
  return GRADE_BAND_PRESETS.filter((band) =>
    ["A", "B", "C", "D"].includes(band.label),
  ).map((band) => ({
    id: `${(courseCode || "course").toLowerCase()}-${band.label.toLowerCase()}`,
    label: band.label,
    threshold: band.threshold,
  }));
}

function getInitialCourseThemeId(course?: Course) {
  const resolvedThemeId = course ? getCourseTheme(course).id : undefined;

  if (
    resolvedThemeId &&
    selectableCourseThemeOptions.some((theme) => theme.id === resolvedThemeId)
  ) {
    return resolvedThemeId;
  }

  return selectableCourseThemeOptions[0].id;
}
