"use client";

import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";
import { FlaskConical, GripVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssessmentComposerDialog } from "@/components/workspace/assessment-composer-dialog";
import { GroupedAssessmentDialog } from "@/components/workspace/grouped-assessment-dialog";
import {
  WorkspaceTable,
  WorkspaceTableCell,
  WorkspaceTableFrame,
  WorkspaceTableHeader,
  WorkspaceTableHeaderCell,
  WorkspaceTableRow,
} from "@/components/workspace/workspace-table";
import {
  formatPercent,
  getAssessmentPercent,
  getGroupedAssessmentMetrics,
  isSingleAssessment,
} from "@/lib/grade-utils";
import {
  Assessment,
  Course,
  GroupedAssessment,
  SingleAssessment,
} from "@/lib/types";

interface AssessmentTableProps {
  course: Course;
  isExperimenting: boolean;
  onStartExperiment: () => void;
  onSaveAssessment: (courseId: string, assessment: Assessment) => void;
  onReorderAssessments: (
    courseId: string,
    fromAssessmentId: string,
    toAssessmentId: string,
  ) => void;
}

const inlineTextInputClassName =
  "h-auto w-full rounded-none border-0 bg-transparent px-0 py-0 text-base font-medium leading-normal text-stone-950 shadow-none focus-visible:ring-0";

const inlineValueInputClassName =
  "h-auto w-full rounded-none border-0 bg-transparent px-0 py-0 text-sm font-medium leading-normal text-stone-950 shadow-none [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function AssessmentTable({
  course,
  isExperimenting,
  onStartExperiment,
  onSaveAssessment,
  onReorderAssessments,
}: AssessmentTableProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div className="grid min-h-0 content-start">
      <div className="hidden md:block">
        <WorkspaceTableFrame>
          <WorkspaceTable>
            <WorkspaceTableHeader>
              <tr>
                <WorkspaceTableHeaderCell className="w-7 px-1 text-center align-middle lg:w-8 lg:px-2 min-[1024px]:max-[1120px]:w-6 min-[1024px]:max-[1120px]:px-0.5">
                  <div className="flex justify-center">
                    <Button
                      aria-label="Start experiment mode"
                      className="group relative h-auto w-auto rounded-none border-0 bg-transparent p-0 text-stone-400 shadow-none hover:bg-transparent hover:text-sky-600"
                      disabled={isExperimenting}
                      onClick={onStartExperiment}
                      size="icon"
                      title="Experiment mode"
                      type="button"
                      variant="ghost"
                    >
                      <span className="pointer-events-none absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-[7px] rounded-full bg-sky-400/0 opacity-0 transition-opacity duration-200 group-hover:bg-sky-400/80 group-hover:opacity-100 group-hover:animate-ping" />
                      <span
                        className="pointer-events-none absolute -top-2 left-1/2 h-1 w-1 -translate-x-[1px] rounded-full bg-sky-300/0 opacity-0 transition-opacity duration-200 group-hover:bg-sky-300/90 group-hover:opacity-100 group-hover:animate-ping"
                        style={{ animationDelay: "120ms" }}
                      />
                      <span
                        className="pointer-events-none absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-[5px] rounded-full bg-sky-200/0 opacity-0 transition-opacity duration-200 group-hover:bg-sky-200/90 group-hover:opacity-100 group-hover:animate-ping"
                        style={{ animationDelay: "240ms" }}
                      />
                      <FlaskConical className="-scale-x-100 h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
                    </Button>
                  </div>
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[48%] min-[1024px]:max-[1120px]:px-2">
                  Assignment
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[18%] min-[1024px]:max-[1120px]:px-2">
                  Weight
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[22%] min-[1024px]:max-[1120px]:px-2">
                  Grade
                </WorkspaceTableHeaderCell>
              </tr>
            </WorkspaceTableHeader>
            <tbody>
              {course.assessments.map((assessment) =>
                isSingleAssessment(assessment) ? (
                  <SingleAssessmentRow
                    assessment={assessment}
                    course={course}
                    draggingId={draggingId}
                    key={assessment.id}
                    onDragEnd={() => setDraggingId(null)}
                    onDragStart={() => setDraggingId(assessment.id)}
                    onDropRow={(fromId, toId) =>
                      onReorderAssessments(course.id, fromId, toId)
                    }
                    onSaveAssessment={onSaveAssessment}
                  />
                ) : (
                  <GroupedAssessmentRow
                    assessment={assessment}
                    course={course}
                    draggingId={draggingId}
                    key={assessment.id}
                    onDragEnd={() => setDraggingId(null)}
                    onDragStart={() => setDraggingId(assessment.id)}
                    onDropRow={(fromId, toId) =>
                      onReorderAssessments(course.id, fromId, toId)
                    }
                    onSaveAssessment={onSaveAssessment}
                  />
                ),
              )}
              <AddAssessmentRow
                course={course}
                onSaveAssessment={onSaveAssessment}
              />
            </tbody>
          </WorkspaceTable>
        </WorkspaceTableFrame>
      </div>

      <div className="grid max-h-full gap-3 overflow-auto md:hidden">
        <AssessmentComposerDialog
          course={course}
          onSaveAssessment={onSaveAssessment}
          triggerAsChild
          triggerChildren={
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white/88 px-4 text-sm font-semibold text-stone-900 shadow-card transition hover:bg-white"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add assignment
            </button>
          }
        />
        {course.assessments.map((assessment) =>
          isSingleAssessment(assessment) ? (
            <SingleAssessmentCard
              assessment={assessment}
              key={assessment.id}
              onSaveAssessment={onSaveAssessment}
              courseId={course.id}
            />
          ) : (
            <GroupedAssessmentCard
              assessment={assessment}
              key={assessment.id}
              onSaveAssessment={onSaveAssessment}
              courseId={course.id}
            />
          ),
        )}
      </div>
    </div>
  );
}

function AddAssessmentRow({
  course,
  onSaveAssessment,
}: {
  course: Course;
  onSaveAssessment: (courseId: string, assessment: Assessment) => void;
}) {
  return (
    <WorkspaceTableRow className="bg-stone-100/90">
      <WorkspaceTableCell className="px-1 py-2 text-center lg:px-2 min-[1024px]:max-[1120px]:px-0.5">
        <Plus className="mx-auto h-3.5 w-3.5 text-stone-500" />
      </WorkspaceTableCell>
      <WorkspaceTableCell
        className="px-3 py-2 lg:px-5 min-[1024px]:max-[1120px]:px-2"
        colSpan={3}
      >
        <AssessmentComposerDialog
          course={course}
          onSaveAssessment={onSaveAssessment}
          triggerAsChild
          triggerChildren={
            <button
              className="flex w-full items-center text-left text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 transition hover:text-stone-900"
              type="button"
            >
              Add assignment
            </button>
          }
        />
      </WorkspaceTableCell>
    </WorkspaceTableRow>
  );
}

function SingleAssessmentRow({
  course,
  assessment,
  onSaveAssessment,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropRow,
}: {
  course: Course;
  assessment: SingleAssessment;
  onSaveAssessment: (courseId: string, assessment: Assessment) => void;
  draggingId: string | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropRow: (fromId: string, toId: string) => void;
}) {
  return (
    <WorkspaceTableRow
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => {
        if (draggingId) {
          onDropRow(draggingId, assessment.id);
        }
      }}
    >
      <WorkspaceTableCell className="px-1 py-3 text-center lg:px-2 lg:py-4 min-[1024px]:max-[1120px]:px-0.5">
        <button
          className="cursor-grab text-stone-300 transition hover:text-stone-500 active:cursor-grabbing"
          draggable
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          type="button"
        >
          <GripVertical className="mx-auto h-4 w-4" />
        </button>
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        <InlineText
          align="left"
          display={
            <p className="cursor-text font-medium text-stone-950">
              {assessment.name}
            </p>
          }
          onCommit={(name) =>
            onSaveAssessment(course.id, { ...assessment, name })
          }
          value={assessment.name}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        <InlineNumber
          align="left"
          display={String(assessment.weight)}
          onCommit={(weight) =>
            onSaveAssessment(course.id, { ...assessment, weight })
          }
          value={assessment.weight}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        <InlineAssessmentResult
          align="left"
          assessment={assessment}
          onCommit={(scoreAchieved) =>
            onSaveAssessment(course.id, {
              ...assessment,
              scoreAchieved,
              totalPossible: 100,
              status: scoreAchieved === null ? "ongoing" : "completed",
            })
          }
        />
      </WorkspaceTableCell>
    </WorkspaceTableRow>
  );
}

function GroupedAssessmentRow({
  course,
  assessment,
  onSaveAssessment,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropRow,
}: {
  course: Course;
  assessment: GroupedAssessment;
  onSaveAssessment: (courseId: string, assessment: Assessment) => void;
  draggingId: string | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropRow: (fromId: string, toId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const metrics = getGroupedAssessmentMetrics(assessment);

  return (
    <WorkspaceTableRow
      className="cursor-pointer transition hover:bg-stone-50/70"
      onClick={() => setOpen(true)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => {
        if (draggingId) {
          onDropRow(draggingId, assessment.id);
        }
      }}
    >
      <WorkspaceTableCell
        className="px-1 py-3 text-center lg:px-2 lg:py-4 min-[1024px]:max-[1120px]:px-0.5"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="cursor-grab text-stone-300 transition hover:text-stone-500 active:cursor-grabbing"
          draggable
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          type="button"
        >
          <GripVertical className="mx-auto h-4 w-4" />
        </button>
      </WorkspaceTableCell>
      <WorkspaceTableCell
        className="px-3 py-3 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2"
        onClick={(event) => event.stopPropagation()}
      >
        <InlineText
          align="left"
          display={
            <div className="cursor-text font-medium text-stone-950">
              <span>{assessment.name}</span>
              <span className="ml-1.5 text-sm font-normal text-stone-400">
                ({metrics.totalCount})
              </span>
            </div>
          }
          onCommit={(name) =>
            onSaveAssessment(course.id, { ...assessment, name })
          }
          value={assessment.name}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell
        className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2"
        onClick={(event) => event.stopPropagation()}
      >
        <InlineNumber
          align="left"
          display={String(assessment.weight)}
          onCommit={(weight) =>
            onSaveAssessment(course.id, { ...assessment, weight })
          }
          value={assessment.weight}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        {metrics.currentPercent === null ? (
          <span className="text-stone-400">Pending</span>
        ) : (
          <div className="font-medium text-stone-950">
            <span className="text-stone-400">Av:</span>{" "}
            <span>{formatPercent(metrics.currentPercent)}</span>
          </div>
        )}
      </WorkspaceTableCell>
      <GroupedAssessmentDialog
        assessment={assessment}
        courseId={course.id}
        onOpenChange={setOpen}
        onSaveAssessment={onSaveAssessment}
        open={open}
        triggerChildren={<span className="hidden" />}
        triggerAsChild
      />
    </WorkspaceTableRow>
  );
}

function SingleAssessmentCard({
  courseId,
  assessment,
  onSaveAssessment,
}: {
  courseId: string;
  assessment: SingleAssessment;
  onSaveAssessment: (courseId: string, assessment: Assessment) => void;
}) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-white/80 p-4">
      <p className="font-medium text-stone-950">{assessment.name}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-stone-600">
        <InfoCell label="Weight" value={String(assessment.weight)} />
        <InfoCell
          label="Grade"
          value={
            assessment.scoreAchieved === null
              ? "Pending"
              : formatPercent(getAssessmentPercent(assessment) ?? 0)
          }
        />
      </div>
      <div className="mt-4 grid gap-2">
        <InlineText
          display={<span className="text-sm text-stone-500">Rename</span>}
          onCommit={(name) =>
            onSaveAssessment(courseId, { ...assessment, name })
          }
          value={assessment.name}
        />
      </div>
    </div>
  );
}

function GroupedAssessmentCard({
  courseId,
  assessment,
  onSaveAssessment,
}: {
  courseId: string;
  assessment: GroupedAssessment;
  onSaveAssessment: (courseId: string, assessment: Assessment) => void;
}) {
  const [open, setOpen] = useState(false);
  const metrics = getGroupedAssessmentMetrics(assessment);

  return (
    <div
      className="rounded-[22px] border border-stone-200 bg-white/80 p-4"
      onClick={() => setOpen(true)}
    >
      <p className="font-medium text-stone-950">{assessment.name}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-stone-600">
        <InfoCell label="Weight" value={String(assessment.weight)} />
        <InfoCell
          label="Grade"
          value={
            metrics.currentPercent === null
              ? "Pending"
              : formatPercent(metrics.currentPercent)
          }
        />
      </div>
      <GroupedAssessmentDialog
        assessment={assessment}
        courseId={courseId}
        onOpenChange={setOpen}
        onSaveAssessment={onSaveAssessment}
        open={open}
        triggerChildren={<span className="hidden" />}
        triggerAsChild
      />
    </div>
  );
}

function InlineText({
  value,
  display,
  onCommit,
  align = "left",
}: {
  value: string;
  display: ReactNode;
  onCommit: (value: string) => void;
  align?: "left" | "center";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      placeCaretAtEnd(inputRef.current);
    }
  }, [editing]);

  if (!editing) {
    return (
      <button
        className={`block w-full px-2 py-3 -mx-2 -my-3 ${align === "center" ? "text-center" : "text-left"}`}
        onClick={() => setEditing(true)}
        type="button"
      >
        {display}
      </button>
    );
  }

  return (
    <Input
      className={`${inlineTextInputClassName} ${align === "center" ? "text-center" : "text-left"}`}
      onBlur={() => {
        setEditing(false);
        if (draft !== value) {
          onCommit(draft);
        }
      }}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          inputRef.current?.blur();
        }
        if (event.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      ref={inputRef}
      value={draft}
    />
  );
}

function InlineNumber({
  value,
  display,
  onCommit,
  align = "left",
}: {
  value: number;
  display: string;
  onCommit: (value: number) => void;
  align?: "left" | "center";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      placeCaretAtEnd(inputRef.current);
    }
  }, [editing]);

  if (!editing) {
    return (
      <button
        className={`block w-full cursor-text px-2 py-3 -mx-2 -my-3 ${align === "center" ? "text-center" : "text-left"}`}
        onClick={() => setEditing(true)}
        type="button"
      >
        <span className="font-medium text-stone-950">{display}</span>
      </button>
    );
  }

  return (
    <Input
      className={`${inlineValueInputClassName} w-full ${align === "center" ? "text-center" : "text-left"}`}
      inputMode="decimal"
      onBlur={() => {
        setEditing(false);
        onCommit(parsePlainNumber(draft));
      }}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) =>
        handleInlineNumberKeyDown(event, inputRef, setEditing, setDraft, value)
      }
      ref={inputRef}
      type="text"
      value={draft}
    />
  );
}

function InlineAssessmentResult({
  assessment,
  onCommit,
  align = "left",
}: {
  assessment: SingleAssessment;
  onCommit: (scoreAchieved: number | null) => void;
  align?: "left" | "center";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    assessment.scoreAchieved === null
      ? ""
      : formatEditablePercent(
          assessment.scoreAchieved,
          assessment.totalPossible,
        ),
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(
      assessment.scoreAchieved === null
        ? ""
        : formatEditablePercent(
            assessment.scoreAchieved,
            assessment.totalPossible,
          ),
    );
  }, [assessment.scoreAchieved, assessment.totalPossible]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      placeCaretAtEnd(inputRef.current);
    }
  }, [editing]);

  if (!editing) {
    return (
      <button
        className={`block w-full cursor-text px-2 py-3 -mx-2 -my-3 ${align === "center" ? "text-center" : "text-left"}`}
        onClick={() => setEditing(true)}
        type="button"
      >
        {assessment.scoreAchieved === null ? (
          <span className="text-stone-400">Pending</span>
        ) : (
          <p className="font-medium text-stone-950">
            {formatPercent(getAssessmentPercent(assessment) ?? 0)}
          </p>
        )}
      </button>
    );
  }

  return (
    <Input
      className={`${inlineValueInputClassName} w-full ${align === "center" ? "text-center" : "text-left"}`}
      onBlur={() => {
        setEditing(false);
        onCommit(parseGradeInput(draft));
      }}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          inputRef.current?.blur();
        }
        if (event.key === "Escape") {
          setDraft(
            assessment.scoreAchieved === null
              ? ""
              : formatEditablePercent(
                  assessment.scoreAchieved,
                  assessment.totalPossible,
                ),
          );
          setEditing(false);
        }
      }}
      ref={inputRef}
      type="text"
      value={draft}
    />
  );
}

function handleInlineNumberKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  inputRef: React.RefObject<HTMLInputElement | null>,
  setEditing: (value: boolean) => void,
  setDraft: (value: string) => void,
  value: number,
) {
  if (event.key === "Enter") {
    inputRef.current?.blur();
  }

  if (event.key === "Escape") {
    setDraft(String(value));
    setEditing(false);
  }
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
        {label}
      </p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

function parseGradeInput(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  if (trimmed.includes("/")) {
    const [left, right] = trimmed.split("/");
    const score = Number(left);
    const total = Number(right);

    if (Number.isFinite(score) && Number.isFinite(total) && total > 0) {
      return Number(((score / total) * 100).toFixed(1));
    }
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric;
}

function formatEditablePercent(scoreAchieved: number, totalPossible: number) {
  if (totalPossible <= 0) {
    return String(scoreAchieved);
  }

  return String(Number(((scoreAchieved / totalPossible) * 100).toFixed(1)));
}

function parsePlainNumber(value: string) {
  const numeric = Number(value.trim());
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return numeric;
}

function placeCaretAtEnd(input: HTMLInputElement | null) {
  if (!input) {
    return;
  }

  requestAnimationFrame(() => {
    const position = input.value.length;
    input.setSelectionRange(position, position);
  });
}
