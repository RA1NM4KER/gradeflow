"use client";

import {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { FlaskConical, GripVertical, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssessmentComposerDialog } from "@/components/workspace/assessment-composer-dialog";
import { GroupedAssessmentDialog } from "@/components/workspace/grouped-assessment-dialog";
import { SingleAssessmentDialog } from "@/components/workspace/single-assessment-dialog";
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
  sanitizePlainNumberInput,
  sanitizeScoreExpressionInput,
} from "@/lib/numeric-input";
import {
  Assessment,
  Module,
  GroupedAssessment,
  SingleAssessment,
} from "@/lib/types";

interface AssessmentTableProps {
  module: Module;
  isExperimenting: boolean;
  onStartExperiment: () => void;
  onDeleteAssessment: (courseId: string, assessmentId: string) => void;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
  onReorderAssessments: (
    moduleId: string,
    fromAssessmentId: string,
    toAssessmentId: string,
  ) => void;
}

const inlineTextInputClassName =
  "h-auto w-full rounded-none border-0 bg-transparent px-0 py-0 text-base font-medium leading-normal text-stone-950 shadow-none focus-visible:ring-0";

const inlineValueInputClassName =
  "h-auto w-full rounded-none border-0 bg-transparent px-0 py-0 text-sm font-medium leading-normal text-stone-950 shadow-none [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function AssessmentTable({
  module,
  isExperimenting,
  onStartExperiment,
  onDeleteAssessment,
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
          </WorkspaceTable>
        </WorkspaceTableFrame>
      </div>

      <div className="grid max-h-full gap-3 overflow-auto md:hidden">
        <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-card">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <Button
                aria-label="Start experiment mode"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 text-[0.78rem] font-medium text-stone-600 shadow-none transition hover:bg-stone-50 hover:text-sky-600"
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
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 text-[0.82rem] font-semibold text-stone-900 transition hover:bg-stone-50"
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_90px_90px] border-t border-stone-200 bg-stone-50/70 px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
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
                onSaveAssessment={onSaveAssessment}
              />
            ))}
          </div>

          <div className="border-t border-stone-200 p-4">
            <AssessmentComposerDialog
              module={module}
              onSaveAssessment={onSaveAssessment}
              triggerAsChild
              triggerChildren={
                <button
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-dashed border-stone-300 bg-white text-sm font-medium text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  New assignment
                </button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileAssessmentRow({
  moduleId,
  assessment,
  isExperimenting,
  onDeleteAssessment,
  onSaveAssessment,
}: {
  moduleId: string;
  assessment: Assessment;
  isExperimenting: boolean;
  onDeleteAssessment: (courseId: string, assessmentId: string) => void;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
}) {
  if (isSingleAssessment(assessment)) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_90px_90px] items-center gap-3 border-t border-stone-200 px-4 py-3 text-sm text-stone-700 first:border-t-0">
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0 flex-1">
            <InlineText
              display={
                <span className="block truncate font-medium text-stone-950">
                  {assessment.name}
                </span>
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
            onSaveAssessment(moduleId, {
              ...assessment,
              scoreAchieved,
              totalPossible: 100,
              status: scoreAchieved === null ? "ongoing" : "completed",
            })
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

  return (
    <>
      <button
        className="grid w-full grid-cols-[minmax(0,1fr)_90px_90px] items-center gap-3 border-t border-stone-200 px-4 py-3 text-left text-sm text-stone-700 transition hover:bg-stone-50/70"
        onClick={() => setOpen(true)}
        type="button"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate font-medium text-stone-950">
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
              isExperimenting ? "text-sky-700" : "text-stone-950"
            }`}
          >
            {assessment.weight}
          </span>
        </span>
        <span className="block w-full px-2 py-3 -mx-2 -my-3 text-center">
          {metrics.currentPercent === null ? (
            <span className="text-stone-400">Pending</span>
          ) : (
            <span
              className={`font-medium ${
                isExperimenting ? "text-sky-700" : "text-stone-950"
              }`}
            >
              <span className="mr-1 text-stone-400">Av:</span>
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
    <WorkspaceTableRow className="bg-stone-100/90">
      <WorkspaceTableCell className="px-1 py-2 text-center lg:px-2 min-[1024px]:max-[1120px]:px-0.5">
        <Plus className="mx-auto h-3.5 w-3.5 text-stone-500" />
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
              className="flex w-full items-center text-left text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 transition hover:text-stone-900"
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
            onSaveAssessment(module.id, { ...assessment, name })
          }
          value={assessment.name}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-500 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        {assessment.dueDate || "—"}
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
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
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        <InlineAssessmentResult
          align="left"
          assessment={assessment}
          isExperimenting={isExperimenting}
          onCommit={(scoreAchieved) =>
            onSaveAssessment(module.id, {
              ...assessment,
              scoreAchieved,
              totalPossible: 100,
              status: scoreAchieved === null ? "ongoing" : "completed",
            })
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

  return (
    <WorkspaceTableRow
      className="group/row cursor-pointer transition hover:bg-stone-50/70"
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
            onSaveAssessment(module.id, { ...assessment, name })
          }
          value={assessment.name}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-500 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        {assessment.dueDate || "—"}
      </WorkspaceTableCell>
      <WorkspaceTableCell
        className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2"
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
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        {metrics.currentPercent === null ? (
          <span className="text-stone-400">Pending</span>
        ) : (
          <div
            className={`font-medium ${
              isExperimenting ? "text-sky-700" : "text-stone-950"
            }`}
          >
            <span className="text-stone-400">Av:</span>{" "}
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
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-300 opacity-0 transition group-hover/row:opacity-100 hover:bg-stone-100 hover:text-stone-700 focus-visible:opacity-100"
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

function SingleAssessmentCard({
  moduleId,
  assessment,
  onSaveAssessment,
}: {
  moduleId: string;
  assessment: SingleAssessment;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
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
            onSaveAssessment(moduleId, { ...assessment, name })
          }
          value={assessment.name}
        />
      </div>
    </div>
  );
}

function GroupedAssessmentCard({
  moduleId,
  assessment,
  onSaveAssessment,
}: {
  moduleId: string;
  assessment: GroupedAssessment;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
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
        moduleId={moduleId}
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
            isExperimenting ? "text-sky-700" : "text-stone-950"
          }`}
        >
          {display}
        </span>
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
      onChange={(event) =>
        setDraft(sanitizePlainNumberInput(event.target.value))
      }
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
          <p
            className={`font-medium ${
              isExperimenting ? "text-sky-700" : "text-stone-950"
            }`}
          >
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
          ? "text-stone-300 opacity-0 hover:bg-stone-100 hover:text-stone-700 group-hover/row:opacity-100 focus-visible:opacity-100"
          : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"
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
