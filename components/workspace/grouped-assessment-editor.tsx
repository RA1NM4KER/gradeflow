"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  WorkspaceTable,
  WorkspaceTableCell,
  WorkspaceTableFrame,
  WorkspaceTableHeader,
  WorkspaceTableHeaderCell,
  WorkspaceTableRow,
} from "@/components/workspace/workspace-table";
import {
  getGroupedAssessmentDefinition,
  normalizeDropLowest,
  resizeGroupedAssessmentItems,
} from "@/lib/grouped-assessment-utils";
import {
  sanitizeIntegerInput,
  sanitizePlainNumberInput,
  sanitizeScoreExpressionInput,
} from "@/lib/numeric-input";
import {
  GroupedAssessment,
  GroupedAssessmentCategory,
  GroupedAssessmentItem,
} from "@/lib/types";

const inlineGroupedInputClassName =
  "h-auto w-full rounded-none border-0 bg-transparent px-0 py-0 text-center text-sm font-medium leading-normal text-stone-950 shadow-none focus-visible:ring-0";

const inlineGroupedNumberInputClassName =
  "h-auto w-full rounded-none border-0 bg-transparent px-0 py-0 text-sm font-medium leading-normal text-stone-950 shadow-none [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

interface GroupedAssessmentEditorProps {
  category: GroupedAssessmentCategory;
  value: {
    name: string;
    weight: string;
    itemCount: number;
    dropLowest: number;
    items: GroupedAssessmentItem[];
  };
  onChange: (nextValue: GroupedAssessmentEditorProps["value"]) => void;
}

export function GroupedAssessmentEditor({
  category,
  value,
  onChange,
}: GroupedAssessmentEditorProps) {
  const definition = getGroupedAssessmentDefinition(category);
  const dropLowest = normalizeDropLowest(value.dropLowest, value.itemCount);
  const [itemCountDraft, setItemCountDraft] = useState(String(value.itemCount));
  const [dropLowestDraft, setDropLowestDraft] = useState(String(dropLowest));

  useEffect(() => {
    setItemCountDraft(String(value.itemCount));
  }, [value.itemCount]);

  useEffect(() => {
    setDropLowestDraft(String(dropLowest));
  }, [dropLowest]);

  function update(updates: Partial<GroupedAssessmentEditorProps["value"]>) {
    onChange({
      ...value,
      ...updates,
    });
  }

  function updateItem(itemId: string, updates: Partial<GroupedAssessmentItem>) {
    update({
      items: value.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      ),
    });
  }

  function commitItemCount(rawValue: string) {
    const nextCount = Math.max(Number(rawValue) || 1, 1);
    const nextItems = resizeGroupedAssessmentItems(
      category,
      nextCount,
      value.items,
    );
    const nextDropLowest = normalizeDropLowest(
      value.dropLowest,
      nextItems.length,
    );

    update({
      itemCount: nextItems.length,
      items: nextItems,
      dropLowest: nextDropLowest,
    });

    setItemCountDraft(String(nextItems.length));
    setDropLowestDraft(String(nextDropLowest));
  }

  function commitDropLowest(rawValue: string) {
    const nextDropLowest = normalizeDropLowest(
      Number(rawValue),
      value.itemCount,
    );
    update({
      dropLowest: nextDropLowest,
    });
    setDropLowestDraft(String(nextDropLowest));
  }

  return (
    <div className="flex min-h-0 max-w-[760px] flex-1 flex-col gap-5 sm:gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${category}-name`}>Category name</Label>
          <Input
            className="text-center"
            id={`${category}-name`}
            onChange={(event) => update({ name: event.target.value })}
            value={value.name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${category}-weight`}>Total weight (%)</Label>
          <Input
            className="text-center"
            id={`${category}-weight`}
            max={100}
            min={0}
            onChange={(event) =>
              update({ weight: sanitizePlainNumberInput(event.target.value) })
            }
            inputMode="decimal"
            type="text"
            value={value.weight}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${category}-count`}>Number of items</Label>
          <Input
            className="text-center"
            id={`${category}-count`}
            inputMode="numeric"
            onBlur={() => commitItemCount(itemCountDraft)}
            onChange={(event) =>
              setItemCountDraft(sanitizeIntegerInput(event.target.value))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                setItemCountDraft(String(value.itemCount));
                event.currentTarget.blur();
              }
            }}
            type="text"
            value={itemCountDraft}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${category}-drop`}>Drop lowest</Label>
          <Input
            className="text-center"
            id={`${category}-drop`}
            inputMode="numeric"
            onBlur={() => commitDropLowest(dropLowestDraft)}
            onChange={(event) =>
              setDropLowestDraft(sanitizeIntegerInput(event.target.value))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                setDropLowestDraft(String(dropLowest));
                event.currentTarget.blur();
              }
            }}
            type="text"
            value={dropLowestDraft}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col space-y-3">
        <div className="text-center">
          <p className="text-sm font-semibold text-stone-950">
            {definition.label} items
          </p>
          <p className="text-sm text-stone-500">
            Rename items and capture marks directly in the table.
          </p>
        </div>

        <div className="min-h-0 sm:hidden">
          <div className="max-h-[34vh] overflow-auto rounded-[18px] border border-stone-200 bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_92px] border-b border-stone-200 bg-stone-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              <span>Assignment</span>
              <span className="text-right">Grade</span>
            </div>
            {value.items.map((item) => (
              <div
                className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3 border-t border-stone-200 px-4 py-3 first:border-t-0"
                key={item.id}
              >
                <Input
                  className="h-auto rounded-none border-0 bg-transparent px-0 py-0 text-left text-base font-medium text-stone-950 shadow-none focus-visible:ring-0"
                  id={`${category}-label-${item.id}`}
                  onChange={(event) =>
                    updateItem(item.id, { label: event.target.value })
                  }
                  value={item.label}
                />
                <GroupedScoreInput
                  id={`${category}-score-${item.id}`}
                  onCommit={(scoreAchieved) =>
                    updateItem(item.id, {
                      scoreAchieved,
                      totalPossible: 100,
                    })
                  }
                  value={item.scoreAchieved}
                />
              </div>
            ))}
          </div>
        </div>

        <WorkspaceTableFrame className="mx-auto hidden max-h-[48vh] w-fit max-w-full rounded-[20px] sm:inline-block">
          <WorkspaceTable className="w-auto min-w-[440px] table-auto">
            <WorkspaceTableHeader className="text-[11px] tracking-[0.14em]">
              <tr>
                <WorkspaceTableHeaderCell className="w-[280px] py-2.5 text-center lg:px-5 lg:py-3">
                  Title
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[120px] py-2.5 text-center lg:px-5 lg:py-3">
                  Mark
                </WorkspaceTableHeaderCell>
              </tr>
            </WorkspaceTableHeader>
            <tbody>
              {value.items.map((item) => (
                <WorkspaceTableRow key={item.id}>
                  <WorkspaceTableCell className="py-2.5 lg:px-5 lg:py-3">
                    <Input
                      className={inlineGroupedInputClassName}
                      id={`${category}-label-${item.id}`}
                      onChange={(event) =>
                        updateItem(item.id, { label: event.target.value })
                      }
                      value={item.label}
                    />
                  </WorkspaceTableCell>
                  <WorkspaceTableCell className="py-2.5 text-center lg:px-5 lg:py-3">
                    <GroupedScoreInput
                      id={`${category}-score-${item.id}`}
                      onCommit={(scoreAchieved) =>
                        updateItem(item.id, {
                          scoreAchieved,
                          totalPossible: 100,
                        })
                      }
                      value={item.scoreAchieved}
                    />
                  </WorkspaceTableCell>
                </WorkspaceTableRow>
              ))}
            </tbody>
          </WorkspaceTable>
        </WorkspaceTableFrame>
      </div>
    </div>
  );
}

export function getGroupedAssessmentEditorValue(assessment: GroupedAssessment) {
  return {
    name: assessment.name,
    weight: String(assessment.weight),
    itemCount: assessment.items.length,
    dropLowest: assessment.dropLowest,
    items: assessment.items,
  };
}

function GroupedScoreInput({
  id,
  value,
  onCommit,
}: {
  id: string;
  value: number | null;
  onCommit: (value: number | null) => void;
}) {
  const [draft, setDraft] = useState(formatGroupedScoreInput(value));

  useEffect(() => {
    setDraft(formatGroupedScoreInput(value));
  }, [value]);

  return (
    <div className="relative ml-auto w-[88px] sm:mx-auto">
      <Input
        className={`${inlineGroupedNumberInputClassName} pr-5 text-center`}
        id={id}
        inputMode="decimal"
        onBlur={() => {
          const parsed = parseGroupedScoreInput(draft);
          setDraft(formatGroupedScoreInput(parsed));
          onCommit(parsed);
        }}
        onChange={(event) =>
          setDraft(sanitizeScoreExpressionInput(event.target.value))
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }

          if (event.key === "Escape") {
            setDraft(formatGroupedScoreInput(value));
            event.currentTarget.blur();
          }
        }}
        placeholder="--"
        type="text"
        value={draft}
      />
      {draft.trim() !== "" && !draft.includes("/") ? (
        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-sm text-stone-400">
          %
        </span>
      ) : null}
    </div>
  );
}

function parseGroupedScoreInput(value: string) {
  const normalized = value.trim();
  if (normalized === "") {
    return null;
  }

  if (normalized.includes("/")) {
    const [left, right] = normalized
      .split("/")
      .map((part) => Number(part.trim()));

    if (Number.isFinite(left) && Number.isFinite(right) && right > 0) {
      return roundGroupedScore((left / right) * 100);
    }

    return null;
  }

  const numeric = Number(normalized.replace("%", "").trim());
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return roundGroupedScore(numeric);
}

function formatGroupedScoreInput(value: number | null) {
  if (value === null) {
    return "";
  }

  return Number.isInteger(value) ? String(value) : String(value);
}

function roundGroupedScore(value: number) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return Math.round(clamped * 10) / 10;
}
