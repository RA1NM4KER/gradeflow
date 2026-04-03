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
    label: "Category",
    itemPrefix: "Tut",
    defaultName: "",
    defaultWeight: 20,
    defaultItemCount: 10,
    defaultDropLowest: 2,
    dueDateLabel: "Category series",
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

function toTitleCase(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getGroupedAssessmentItemPrefix(name: string) {
  const normalized = name.trim().toLowerCase();

  if (!normalized) {
    return "Item";
  }

  if (normalized === "quizzes" || normalized === "quiz") {
    return "Quiz";
  }

  if (normalized === "tutorials" || normalized === "tutorial") {
    return "Tutorial";
  }

  if (normalized === "tuts" || normalized === "tut") {
    return "Tut";
  }

  if (normalized.endsWith("ies")) {
    return toTitleCase(`${normalized.slice(0, -3)}y`);
  }

  if (normalized.endsWith("zes")) {
    return toTitleCase(`${normalized.slice(0, -3)}z`);
  }

  if (normalized.endsWith("s") && normalized.length > 1) {
    return toTitleCase(normalized.slice(0, -1));
  }

  return toTitleCase(normalized);
}

export function buildGroupedAssessmentItems(
  _category: GroupedAssessmentCategory,
  count: number,
  name: string,
  existing?: GroupedAssessmentItem[],
) {
  const safeCount = clampCount(Number.isFinite(count) ? count : 0, 1, 20);
  const itemPrefix = getGroupedAssessmentItemPrefix(name);

  return Array.from({ length: safeCount }, (_, index) => {
    const existingItem = existing?.[index];

    return (
      existingItem ?? {
        id: createUuid(),
        label: `${itemPrefix} ${index + 1}`,
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
  const defaultName = definition.defaultName;

  return {
    name: defaultName,
    weight: String(definition.defaultWeight),
    itemCount: definition.defaultItemCount,
    dropLowest: definition.defaultDropLowest,
    items: buildGroupedAssessmentItems(
      category,
      definition.defaultItemCount,
      defaultName,
    ),
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
  const items = buildGroupedAssessmentItems(
    category,
    itemCount,
    values.name,
    values.items,
  );

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
  name: string,
  currentItems: GroupedAssessmentItem[],
) {
  return buildGroupedAssessmentItems(category, count, name, currentItems);
}
