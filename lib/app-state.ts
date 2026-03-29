import {
  Assessment,
  GradeBand,
  GroupedAssessment,
  GroupedAssessmentItem,
  Module,
  Semester,
  SingleAssessment,
} from "@/lib/types";

export interface AppState {
  semesters: Semester[];
  selectedSemesterId: string;
}

export interface PersistedAppState extends AppState {
  version: number;
}

type RecordValue = Record<string, unknown>;

const LEGACY_APP_STATE_VERSION = 1;
export const APP_STATE_VERSION = 2;

export function getDefaultAppState(): AppState {
  const initialSemester: Semester = {
    id: "semester-1-2026",
    name: "Semester 1 2026",
    periodLabel: "January to June",
    modules: [],
  };

  return {
    semesters: [initialSemester],
    selectedSemesterId: initialSemester.id,
  };
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function normalizeGradeBand(rawBand: unknown, index: number): GradeBand {
  const band = isRecord(rawBand) ? rawBand : {};

  return {
    id: getString(band.id, `grade-band-${index + 1}`),
    label: getString(band.label, `Band ${index + 1}`),
    threshold: getNumber(band.threshold, 0),
  };
}

function normalizeGroupedAssessmentItem(
  rawItem: unknown,
  index: number,
): GroupedAssessmentItem {
  const item = isRecord(rawItem) ? rawItem : {};

  return {
    id: getString(item.id, `tutorial-item-${index + 1}`),
    label: getString(item.label, `Item ${index + 1}`),
    scoreAchieved:
      item.scoreAchieved === null
        ? null
        : getNullableNumber(item.scoreAchieved),
    totalPossible: getNumber(item.totalPossible, 100),
  };
}

function normalizeSingleAssessment(
  rawAssessment: RecordValue,
  index: number,
): SingleAssessment {
  return {
    id: getString(rawAssessment.id, `assessment-${index + 1}`),
    kind: "single",
    name: getString(rawAssessment.name, `Assessment ${index + 1}`),
    weight: getNumber(rawAssessment.weight, 0),
    dueDate: getString(rawAssessment.dueDate),
    status: rawAssessment.status === "completed" ? "completed" : "ongoing",
    scoreAchieved:
      rawAssessment.scoreAchieved === null
        ? null
        : getNullableNumber(rawAssessment.scoreAchieved),
    totalPossible: getNumber(rawAssessment.totalPossible, 100),
    category:
      rawAssessment.category === "exam" ||
      rawAssessment.category === "project" ||
      rawAssessment.category === "quiz" ||
      rawAssessment.category === "presentation"
        ? rawAssessment.category
        : "assignment",
  };
}

function normalizeGroupedAssessment(
  rawAssessment: RecordValue,
  index: number,
): GroupedAssessment {
  return {
    id: getString(rawAssessment.id, `grouped-assessment-${index + 1}`),
    kind: "group",
    name: getString(rawAssessment.name, `Tutorials ${index + 1}`),
    weight: getNumber(rawAssessment.weight, 0),
    dueDate: getString(rawAssessment.dueDate),
    status: rawAssessment.status === "completed" ? "completed" : "ongoing",
    category: "tutorials",
    dropLowest: getNumber(rawAssessment.dropLowest, 0),
    items: getArray(rawAssessment.items).map((item, itemIndex) =>
      normalizeGroupedAssessmentItem(item, itemIndex),
    ),
  };
}

function normalizeAssessment(
  rawAssessment: unknown,
  index: number,
): Assessment {
  const assessment = isRecord(rawAssessment) ? rawAssessment : {};

  if (assessment.kind === "group" || assessment.category === "tutorials") {
    return normalizeGroupedAssessment(assessment, index);
  }

  return normalizeSingleAssessment(assessment, index);
}

function normalizeModule(rawModule: unknown, index: number): Module {
  const module = isRecord(rawModule) ? rawModule : {};

  return {
    id: getString(module.id, `module-${index + 1}`),
    code: getString(module.code, `MOD${index + 1}`),
    name: getString(module.name, `Module ${index + 1}`),
    instructor: getString(module.instructor),
    credits: getNumber(module.credits, 0),
    accent: getString(
      module.accent,
      "from-stone-950 via-stone-900 to-stone-700",
    ),
    gradeBands: getArray(module.gradeBands).map((band, bandIndex) =>
      normalizeGradeBand(band, bandIndex),
    ),
    assessments: getArray(module.assessments).map(
      (assessment, assessmentIndex) =>
        normalizeAssessment(assessment, assessmentIndex),
    ),
  };
}

function normalizeSemester(rawSemester: unknown, index: number): Semester {
  const semester = isRecord(rawSemester) ? rawSemester : {};
  const rawModules = Array.isArray(semester.modules)
    ? semester.modules
    : getArray(semester.courses);

  return {
    id: getString(semester.id, `semester-${index + 1}`),
    name: getString(semester.name, `Semester ${index + 1}`),
    periodLabel: getString(semester.periodLabel),
    modules: rawModules.map((module, moduleIndex) =>
      normalizeModule(module, moduleIndex),
    ),
  };
}

function extractRawAppState(rawState: RecordValue): AppState {
  return {
    semesters: getArray(rawState.semesters).map((semester, index) =>
      normalizeSemester(semester, index),
    ),
    selectedSemesterId: getString(rawState.selectedSemesterId),
  };
}

export function normalizeAppState(state?: Partial<AppState> | null): AppState {
  const fallback = getDefaultAppState();
  const semesters =
    state?.semesters && state.semesters.length > 0
      ? state.semesters
      : fallback.semesters;
  const selectedSemesterId =
    state?.selectedSemesterId &&
    semesters.some((semester) => semester.id === state.selectedSemesterId)
      ? state.selectedSemesterId
      : (semesters[0]?.id ?? "");

  return {
    semesters,
    selectedSemesterId,
  };
}

export function toPersistedAppState(state: AppState): PersistedAppState {
  return {
    version: APP_STATE_VERSION,
    ...normalizeAppState(state),
  };
}

function migrateLegacyAppState(rawState: RecordValue): PersistedAppState {
  return toPersistedAppState(extractRawAppState(rawState));
}

function migrateVersion2AppState(rawState: RecordValue): PersistedAppState {
  return toPersistedAppState(extractRawAppState(rawState));
}

export function migrateAppState(
  rawState: unknown,
  strict = false,
): PersistedAppState {
  if (!isRecord(rawState)) {
    if (strict) {
      throw new Error(
        "This backup file does not contain a valid Gradeflow state.",
      );
    }

    return toPersistedAppState(getDefaultAppState());
  }

  if (strict && !Array.isArray(rawState.semesters)) {
    throw new Error(
      "This backup file is missing the semesters data Gradeflow needs.",
    );
  }

  const rawVersion =
    typeof rawState.version === "number"
      ? rawState.version
      : LEGACY_APP_STATE_VERSION;

  if (rawVersion > APP_STATE_VERSION) {
    throw new Error(
      `This backup was created by a newer Gradeflow version (${rawVersion}).`,
    );
  }

  switch (rawVersion) {
    case LEGACY_APP_STATE_VERSION:
      return migrateLegacyAppState(rawState);
    case APP_STATE_VERSION:
      return migrateVersion2AppState(rawState);
    default:
      throw new Error(`Unsupported Gradeflow state version: ${rawVersion}.`);
  }
}

export function serializePersistedAppState(state: AppState) {
  return JSON.stringify(toPersistedAppState(state), null, 2);
}
