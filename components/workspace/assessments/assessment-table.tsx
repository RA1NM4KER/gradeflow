"use client";

import React, {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { FlaskConical, GripVertical, Pencil, Plus } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AssessmentComposerDialog } from "@/components/workspace/assessments/assessment-composer-dialog";
import { GroupedAssessmentDialog } from "@/components/workspace/assessments/grouped-assessment-dialog";
import { SingleAssessmentDialog } from "@/components/workspace/assessments/single-assessment-dialog";
import {
  CoursesTable,
  WorkspaceTableCell,
  WorkspaceTableFrame,
  WorkspaceTableHeader,
  WorkspaceTableHeaderCell,
  WorkspaceTableRow,
} from "@/components/workspace/shared/courses-table";
import {
  formatEditablePercent as formatEditablePercentInput,
  formatPercent,
  getAssessmentPercent,
  getGroupedAssessmentMetrics,
  isSingleAssessment,
  parsePercentInput,
} from "@/lib/grades/grade-utils";
import { getCourseTheme } from "@/lib/course/course-theme";
import {
  sanitizePlainNumberInput,
  sanitizeScoreExpressionInput,
} from "@/lib/assessments/numeric-input";
import { getExperimentTheme } from "@/lib/grades/experiment-theme";
import {
  Assessment,
  Module,
  GroupedAssessment,
  SingleAssessment,
} from "@/lib/shared/types";
import { cn } from "@/lib/shared/utils";

interface AssessmentTableProps {
  module: Module;
  isExperimenting: boolean;
  onStartExperiment: () => void;
  onDeleteAssessment: (courseId: string, assessmentId: string) => void;
  onRecordGrade: (
    moduleId: string,
    assessmentId: string,
    scoreAchieved: number,
    totalPossible: number,
  ) => void;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
  onReorderAssessments: (
    moduleId: string,
    fromAssessmentId: string,
    toAssessmentId: string,
  ) => void;
}

export function AssessmentTable({
  module,
  isExperimenting,
  onStartExperiment,
  onDeleteAssessment,
  onRecordGrade,
  onSaveAssessment,
  onReorderAssessments,
}: AssessmentTableProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const theme = getCourseTheme(module, resolvedTheme);
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <div className="grid min-h-0 content-start">
      <div className="hidden md:block">
        <WorkspaceTableFrame>
          <CoursesTable>
            <WorkspaceTableHeader
              className={
                isExperimenting
                  ? `${experimentTheme.headerBackground} ${experimentTheme.accentText}`
                  : theme.tableHeaderAccent
              }
            >
              <tr>
                <WorkspaceTableHeaderCell className="w-7 px-1 text-center align-middle lg:w-8 lg:px-2 min-[1024px]:max-[1120px]:w-6 min-[1024px]:max-[1120px]:px-0.5">
                  <div className="flex justify-center">
                    <span className="sr-only">Experiment mode</span>
                  </div>
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[40%] min-[1024px]:max-[1120px]:px-2">
                  Assignment
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[20%] min-[1024px]:max-[1120px]:px-2">
                  Due date
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[14%] min-[1024px]:max-[1120px]:px-2">
                  Weight
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[18%] min-[1024px]:max-[1120px]:px-2">
                  Grade
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-9 px-1 lg:px-2 min-[1024px]:max-[1120px]:w-8 min-[1024px]:max-[1120px]:px-1">
                  <span className="sr-only">Edit</span>
                </WorkspaceTableHeaderCell>
              </tr>
            </WorkspaceTableHeader>
            <tbody>
              {module.assessments.map((assessment) =>
                isSingleAssessment(assessment) ? (
                  <SingleAssessmentRow
                    assessment={assessment}
                    isExperimenting={isExperimenting}
                    module={module}
                    draggingId={draggingId}
                    key={assessment.id}
                    onDeleteAssessment={onDeleteAssessment}
                    onDragEnd={() => setDraggingId(null)}
                    onDragStart={() => setDraggingId(assessment.id)}
                    onDropRow={(fromId, toId) =>
                      onReorderAssessments(module.id, fromId, toId)
                    }
                    onRecordGrade={onRecordGrade}
                    onSaveAssessment={onSaveAssessment}
                  />
                ) : (
                  <GroupedAssessmentRow
                    assessment={assessment}
                    isExperimenting={isExperimenting}
                    module={module}
                    draggingId={draggingId}
                    key={assessment.id}
                    onDeleteAssessment={onDeleteAssessment}
                    onDragEnd={() => setDraggingId(null)}
                    onDragStart={() => setDraggingId(assessment.id)}
                    onDropRow={(fromId, toId) =>
                      onReorderAssessments(module.id, fromId, toId)
                    }
                    onSaveAssessment={onSaveAssessment}
                  />
                ),
              )}
              <AddAssessmentRow
                module={module}
                onSaveAssessment={onSaveAssessment}
              />
            </tbody>
          </CoursesTable>
        </WorkspaceTableFrame>
      </div>

      <div className="grid max-h-full gap-3 overflow-auto md:hidden">
        <Card
          className="overflow-hidden rounded-[22px]"
          variant="surface-subtle"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <Button
                aria-label="Start experiment mode"
                className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[0.78rem] font-medium text-ink-soft shadow-none transition hover:bg-surface-muted ${experimentTheme.hoverText}`}
                disabled={isExperimenting}
                onClick={onStartExperiment}
                title="Experiment mode"
                type="button"
                variant="ghost"
              >
                <FlaskConical className="-scale-x-100 h-3.5 w-3.5" />
                What-if
              </Button>
              <AssessmentComposerDialog
                module={module}
                onSaveAssessment={onSaveAssessment}
                triggerAsChild
                triggerChildren={
                  <button
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[0.82rem] font-semibold text-foreground transition hover:bg-surface-muted"
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                }
              />
            </div>
          </div>

          <div
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_90px_90px] border-t border-line px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em]",
              isExperimenting
                ? `${experimentTheme.headerBackground} ${experimentTheme.accentText}`
                : theme.tableHeaderAccent,
            )}
          >
            <span>Assignment</span>
            <span className="text-center">Weight</span>
            <span className="text-right">Grade</span>
          </div>

          <div>
            {module.assessments.map((assessment) => (
              <MobileAssessmentRow
                assessment={assessment}
                isExperimenting={isExperimenting}
                key={assessment.id}
                moduleId={module.id}
                onDeleteAssessment={onDeleteAssessment}
                onRecordGrade={onRecordGrade}
                onSaveAssessment={onSaveAssessment}
              />
            ))}
          </div>

          <div className="border-t border-line p-4">
            <AssessmentComposerDialog
              module={module}
              onSaveAssessment={onSaveAssessment}
              triggerAsChild
              triggerChildren={
                <button
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-dashed border-line-strong bg-surface text-sm font-medium text-ink-soft transition hover:border-line-strong hover:text-foreground"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  New assignment
                </button>
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MobileAssessmentRow({
  moduleId,
  assessment,
  isExperimenting,
  onDeleteAssessment,
  onRecordGrade,
  onSaveAssessment,
}: {
  moduleId: string;
  assessment: Assessment;
  isExperimenting: boolean;
  onDeleteAssessment: (courseId: string, assessmentId: string) => void;
  onRecordGrade: (
    moduleId: string,
    assessmentId: string,
    scoreAchieved: number,
    totalPossible: number,
  ) => void;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
}) {
  if (isSingleAssessment(assessment)) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_90px_90px] items-center gap-3 border-t border-line px-4 py-3 text-sm text-ink-soft first:border-t-0">
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0 flex-1">
            <InlineText
              display={
                <div>
                  <span className="block truncate font-medium text-foreground">
                    {assessment.name}
                  </span>
                  {assessment.subminimumPercent !== null ? (
                    <span className="block truncate text-[0.72rem] text-ink-subtle">
                      Need {formatPercent(assessment.subminimumPercent)} in this
                      assignment
                    </span>
                  ) : null}
                </div>
              }
              onCommit={(name) =>
                onSaveAssessment(moduleId, { ...assessment, name })
              }
              value={assessment.name}
            />
          </div>
          <SingleAssessmentDialog
            assessment={assessment}
            moduleId={moduleId}
            onDeleteAssessment={onDeleteAssessment}
            onSaveAssessment={onSaveAssessment}
            triggerAsChild
            triggerChildren={<EditAssessmentButton label={assessment.name} />}
          />
        </div>
        <InlineNumber
          align="center"
          display={String(assessment.weight)}
          isExperimenting={isExperimenting}
          onCommit={(weight) =>
            onSaveAssessment(moduleId, { ...assessment, weight })
          }
          value={assessment.weight}
        />
        <InlineAssessmentResult
          align="center"
          assessment={assessment}
          isExperimenting={isExperimenting}
          onCommit={(scoreAchieved) =>
            scoreAchieved === null
              ? onSaveAssessment(moduleId, {
                  ...assessment,
                  scoreAchieved: null,
                  totalPossible: 100,
                  status: "ongoing",
                })
              : onRecordGrade(moduleId, assessment.id, scoreAchieved, 100)
          }
        />
      </div>
    );
  }

  return (
    <MobileGroupedAssessmentRow
      assessment={assessment}
      isExperimenting={isExperimenting}
      moduleId={moduleId}
      onDeleteAssessment={onDeleteAssessment}
      onSaveAssessment={onSaveAssessment}
    />
  );
}

function MobileGroupedAssessmentRow({
  moduleId,
  assessment,
  isExperimenting,
  onDeleteAssessment,
  onSaveAssessment,
}: {
  moduleId: string;
  assessment: GroupedAssessment;
  isExperimenting: boolean;
  onDeleteAssessment: (courseId: string, assessmentId: string) => void;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
}) {
  const [open, setOpen] = useState(false);
  const metrics = getGroupedAssessmentMetrics(assessment);
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <>
      <button
        className="grid w-full grid-cols-[minmax(0,1fr)_90px_90px] items-center gap-3 border-t border-line px-4 py-3 text-left text-sm text-ink-soft transition hover:bg-surface-muted/70"
        onClick={() => setOpen(true)}
        type="button"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
            {assessment.name}
          </span>
          <EditAssessmentButton
            label={assessment.name}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(true);
            }}
          />
        </div>
        <span className="block w-full px-2 py-3 -mx-2 -my-3 text-center">
          <span
            className={`font-medium ${
              isExperimenting ? experimentTheme.accentText : "text-foreground"
            }`}
          >
            {assessment.weight}
          </span>
        </span>
        <span className="block w-full px-2 py-3 -mx-2 -my-3 text-center">
          {metrics.currentPercent === null ? (
            <span className="text-ink-subtle">--</span>
          ) : (
            <span
              className={`font-medium ${
                isExperimenting ? experimentTheme.accentText : "text-foreground"
              }`}
            >
              <span className="mr-1 text-ink-subtle">Av:</span>
              {formatPercent(metrics.currentPercent)}
            </span>
          )}
        </span>
      </button>
      <GroupedAssessmentDialog
        assessment={assessment}
        moduleId={moduleId}
        onDeleteAssessment={onDeleteAssessment}
        onOpenChange={setOpen}
        onSaveAssessment={onSaveAssessment}
        open={open}
        triggerChildren={<span className="hidden" />}
        triggerAsChild
      />
    </>
  );
}

function AddAssessmentRow({
  module,
  onSaveAssessment,
}: {
  module: Module;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
}) {
  return (
    <WorkspaceTableRow className="bg-surface-muted/90">
      <WorkspaceTableCell className="px-1 py-2 text-center lg:px-2 min-[1024px]:max-[1120px]:px-0.5">
        <Plus className="mx-auto h-3.5 w-3.5 text-ink-soft" />
      </WorkspaceTableCell>
      <WorkspaceTableCell
        className="px-3 py-2 lg:px-5 min-[1024px]:max-[1120px]:px-2"
        colSpan={4}
      >
        <AssessmentComposerDialog
          module={module}
          onSaveAssessment={onSaveAssessment}
          triggerAsChild
          triggerChildren={
            <button
              className="flex w-full items-center text-left text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-foreground"
              type="button"
            >
              Add assignment
            </button>
          }
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell />
    </WorkspaceTableRow>
  );
}

function SingleAssessmentRow({
  module,
  assessment,
  isExperimenting = false,
  onDeleteAssessment,
  onRecordGrade,
  onSaveAssessment,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropRow,
}: {
  module: Module;
  assessment: SingleAssessment;
  isExperimenting?: boolean;
  onDeleteAssessment: (courseId: string, assessmentId: string) => void;
  onRecordGrade: (
    moduleId: string,
    assessmentId: string,
    scoreAchieved: number,
    totalPossible: number,
  ) => void;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
  draggingId: string | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropRow: (fromId: string, toId: string) => void;
}) {
  return (
    <WorkspaceTableRow
      className="group/row"
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => {
        if (draggingId) {
          onDropRow(draggingId, assessment.id);
        }
      }}
    >
      <WorkspaceTableCell className="px-1 py-3 text-center lg:px-2 lg:py-4 min-[1024px]:max-[1120px]:px-0.5">
        <button
          className="cursor-grab text-line-strong transition hover:text-ink-soft active:cursor-grabbing"
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
            <div className="cursor-text">
              <p className="font-medium text-foreground">{assessment.name}</p>
              {assessment.subminimumPercent !== null ? (
                <p className="text-xs text-ink-subtle">
                  Need {formatPercent(assessment.subminimumPercent)} here
                </p>
              ) : null}
            </div>
          }
          onCommit={(name) =>
            onSaveAssessment(module.id, { ...assessment, name })
          }
          value={assessment.name}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-ink-soft lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        {assessment.dueDate || "—"}
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-ink-soft lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        <InlineNumber
          align="left"
          display={String(assessment.weight)}
          isExperimenting={isExperimenting}
          onCommit={(weight) =>
            onSaveAssessment(module.id, { ...assessment, weight })
          }
          value={assessment.weight}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-ink-soft lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        <InlineAssessmentResult
          align="left"
          assessment={assessment}
          isExperimenting={isExperimenting}
          onCommit={(scoreAchieved) =>
            scoreAchieved === null
              ? onSaveAssessment(module.id, {
                  ...assessment,
                  scoreAchieved: null,
                  totalPossible: 100,
                  status: "ongoing",
                })
              : onRecordGrade(module.id, assessment.id, scoreAchieved, 100)
          }
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-1 py-3 text-center lg:px-2 lg:py-4 min-[1024px]:max-[1120px]:px-1">
        <SingleAssessmentDialog
          assessment={assessment}
          moduleId={module.id}
          onDeleteAssessment={onDeleteAssessment}
          onSaveAssessment={onSaveAssessment}
          triggerAsChild
          triggerChildren={
            <EditAssessmentButton label={assessment.name} subtle />
          }
        />
      </WorkspaceTableCell>
    </WorkspaceTableRow>
  );
}

function GroupedAssessmentRow({
  module,
  assessment,
  isExperimenting = false,
  onDeleteAssessment,
  onSaveAssessment,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropRow,
}: {
  module: Module;
  assessment: GroupedAssessment;
  isExperimenting?: boolean;
  onDeleteAssessment: (courseId: string, assessmentId: string) => void;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
  draggingId: string | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropRow: (fromId: string, toId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const metrics = getGroupedAssessmentMetrics(assessment);
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <WorkspaceTableRow
      className="group/row cursor-pointer transition hover:bg-surface-muted/70"
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
          className="cursor-grab text-line-strong transition hover:text-ink-soft active:cursor-grabbing"
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
            <div className="cursor-text font-medium text-foreground">
              <span>{assessment.name}</span>
              <span className="ml-1.5 text-sm font-normal text-ink-subtle">
                ({metrics.totalCount})
              </span>
            </div>
          }
          onCommit={(name) =>
            onSaveAssessment(module.id, { ...assessment, name })
          }
          value={assessment.name}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-ink-soft lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        {assessment.dueDate || "—"}
      </WorkspaceTableCell>
      <WorkspaceTableCell
        className="px-3 py-3 text-sm text-ink-soft lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2"
        onClick={(event) => event.stopPropagation()}
      >
        <InlineNumber
          align="left"
          display={String(assessment.weight)}
          isExperimenting={isExperimenting}
          onCommit={(weight) =>
            onSaveAssessment(module.id, { ...assessment, weight })
          }
          value={assessment.weight}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-ink-soft lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        {metrics.currentPercent === null ? (
          <span className="text-ink-subtle">--</span>
        ) : (
          <div
            className={`font-medium ${
              isExperimenting ? experimentTheme.accentText : "text-foreground"
            }`}
          >
            <span className="text-ink-subtle">Av:</span>{" "}
            <span>{formatPercent(metrics.currentPercent)}</span>
          </div>
        )}
      </WorkspaceTableCell>
      <WorkspaceTableCell
        className="px-1 py-3 text-center lg:px-2 lg:py-4 min-[1024px]:max-[1120px]:px-1"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label={`Edit ${assessment.name}`}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-line-strong opacity-0 transition group-hover/row:opacity-100 hover:bg-surface-muted hover:text-ink-soft focus-visible:opacity-100"
          onClick={() => setOpen(true)}
          type="button"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </WorkspaceTableCell>
      <GroupedAssessmentDialog
        assessment={assessment}
        moduleId={module.id}
        onDeleteAssessment={onDeleteAssessment}
        onOpenChange={setOpen}
        onSaveAssessment={onSaveAssessment}
        open={open}
        triggerChildren={<span className="hidden" />}
        triggerAsChild
      />
    </WorkspaceTableRow>
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
      className={align === "center" ? "text-center" : "text-left"}
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
      variant="inline-heading"
      value={draft}
    />
  );
}

function InlineNumber({
  value,
  display,
  onCommit,
  isExperimenting = false,
  align = "left",
}: {
  value: number;
  display: string;
  onCommit: (value: number) => void;
  isExperimenting?: boolean;
  align?: "left" | "center";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);

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
        <span
          className={`font-medium ${
            isExperimenting ? experimentTheme.accentText : "text-foreground"
          }`}
        >
          {display}
        </span>
      </button>
    );
  }

  return (
    <Input
      className={align === "center" ? "text-center" : "text-left"}
      inputMode="decimal"
      onBlur={() => {
        setEditing(false);
        onCommit(parsePlainNumber(draft));
      }}
      onChange={(event) =>
        setDraft(sanitizePlainNumberInput(event.target.value))
      }
      onKeyDown={(event) =>
        handleInlineNumberKeyDown(event, inputRef, setEditing, setDraft, value)
      }
      ref={inputRef}
      type="text"
      variant="inline-number"
      value={draft}
    />
  );
}

function InlineAssessmentResult({
  assessment,
  onCommit,
  isExperimenting = false,
  align = "left",
}: {
  assessment: SingleAssessment;
  onCommit: (scoreAchieved: number | null) => void;
  isExperimenting?: boolean;
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
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);

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
    const percent = getAssessmentPercent(assessment);
    const failedSubminimum =
      assessment.subminimumPercent !== null &&
      percent !== null &&
      percent < assessment.subminimumPercent;

    return (
      <button
        className={`block w-full cursor-text px-2 py-3 -mx-2 -my-3 ${align === "center" ? "text-center" : "text-left"}`}
        onClick={() => setEditing(true)}
        type="button"
      >
        {assessment.scoreAchieved === null ? (
          <span className="text-ink-subtle">--</span>
        ) : (
          <div>
            <p
              className={`font-medium ${
                failedSubminimum
                  ? "text-danger"
                  : isExperimenting
                    ? experimentTheme.accentText
                    : "text-foreground"
              }`}
            >
              {formatPercent(percent ?? 0)}
            </p>
            {assessment.subminimumPercent !== null ? (
              <p
                className={cn(
                  "text-[0.72rem]",
                  failedSubminimum ? "text-danger" : "text-ink-subtle",
                )}
              >
                Min {formatPercent(assessment.subminimumPercent)}
              </p>
            ) : null}
          </div>
        )}
      </button>
    );
  }

  return (
    <Input
      className={align === "center" ? "text-center" : "text-left"}
      onBlur={() => {
        setEditing(false);
        onCommit(parseGradeInput(draft));
      }}
      onChange={(event) =>
        setDraft(sanitizeScoreExpressionInput(event.target.value))
      }
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
      variant="inline-number"
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
function parseGradeInput(value: string) {
  return parsePercentInput(value);
}

function formatEditablePercent(scoreAchieved: number, totalPossible: number) {
  return formatEditablePercentInput(scoreAchieved, totalPossible);
}

function parsePlainNumber(value: string) {
  const numeric = Number(value.trim());
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return numeric;
}

function EditAssessmentButton({
  label,
  onClick,
  subtle = false,
}: {
  label: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  subtle?: boolean;
}) {
  return (
    <button
      aria-label={`Edit ${label}`}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
        subtle
          ? "text-line-strong opacity-0 hover:bg-surface-muted hover:text-ink-soft group-hover/row:opacity-100 focus-visible:opacity-100"
          : "text-ink-subtle hover:bg-surface-muted hover:text-ink-soft"
      }`}
      onClick={onClick}
      type="button"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
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
