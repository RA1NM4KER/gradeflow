import {
  GroupedAssessment,
  GroupedAssessmentCategory,
  GroupedAssessmentDefinition,
  GroupedAssessmentItem,
} from "@/lib/types";
import { createUuid } from "@/lib/uuid";

const GROUPED_DEFINITIONS: Record<
  GroupedAssessmentCategory,
  GroupedAssessmentDefinition
> = {
  tutorials: {
    category: "tutorials",
    label: "Tutorials",
    itemPrefix: "Tut",
    defaultName: "Tutorials",
    defaultWeight: 20,
    defaultItemCount: 10,
    defaultDropLowest: 2,
    dueDateLabel: "Tutorial series",
  },
};

function clampCount(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getGroupedAssessmentDefinition(
  category: GroupedAssessmentCategory,
) {
  return GROUPED_DEFINITIONS[category];
}

export function buildGroupedAssessmentItems(
  category: GroupedAssessmentCategory,
  count: number,
  existing?: GroupedAssessmentItem[],
) {
  const definition = getGroupedAssessmentDefinition(category);
  const safeCount = clampCount(Number.isFinite(count) ? count : 0, 1, 20);

  return Array.from({ length: safeCount }, (_, index) => {
    const existingItem = existing?.[index];

    return (
      existingItem ?? {
        id: createUuid(),
        label: `${definition.itemPrefix} ${index + 1}`,
        scoreAchieved: null,
        totalPossible: 100,
      }
    );
  });
}

export function getGroupedAssessmentDefaults(
  category: GroupedAssessmentCategory,
) {
  const definition = getGroupedAssessmentDefinition(category);

  return {
    name: definition.defaultName,
    weight: String(definition.defaultWeight),
    itemCount: definition.defaultItemCount,
    dropLowest: definition.defaultDropLowest,
    items: buildGroupedAssessmentItems(category, definition.defaultItemCount),
  };
}

export function normalizeDropLowest(value: number, itemCount: number) {
  const safeItemCount = clampCount(
    Number.isFinite(itemCount) ? itemCount : 0,
    1,
    20,
  );

  return clampCount(Number.isFinite(value) ? value : 0, 0, safeItemCount - 1);
}

export function buildGroupedAssessment(
  category: GroupedAssessmentCategory,
  values: {
    id?: string;
    name: string;
    weight: number;
    itemCount: number;
    dropLowest: number;
    items?: GroupedAssessmentItem[];
  },
): GroupedAssessment {
  const definition = getGroupedAssessmentDefinition(category);
  const itemCount = clampCount(values.itemCount, 1, 20);
  const items = buildGroupedAssessmentItems(category, itemCount, values.items);

  return {
    id: values.id ?? createUuid(),
    kind: "group",
    category,
    name: values.name || definition.defaultName,
    weight: values.weight,
    dueDate: definition.dueDateLabel,
    dropLowest: normalizeDropLowest(values.dropLowest, itemCount),
    status: "ongoing",
    items,
  };
}

export function resizeGroupedAssessmentItems(
  category: GroupedAssessmentCategory,
  count: number,
  currentItems: GroupedAssessmentItem[],
) {
  return buildGroupedAssessmentItems(category, count, currentItems);
}
