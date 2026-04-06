import {
  Assessment,
  Course,
  GradeBand,
  GroupedAssessment,
  GroupedAssessmentItem,
  Semester,
  SingleAssessment,
} from "@/lib/types";
import { createUuid, ensureUuid } from "@/lib/uuid";

export interface AppState {
  semesters: Semester[];
  selectedSemesterId: string;
}

export interface PersistedAppState extends AppState {
  version: number;
}

export interface PersistedAppStateMetadata {
  snapshot: string;
  updatedAt: string;
  version: number;
}

type RecordValue = Record<string, unknown>;

const UNVERSIONED_APP_STATE_VERSION = 1;
export const APP_STATE_VERSION = 2;

export function getDefaultAppState(): AppState {
  const initialSemester: Semester = {
    id: createUuid(),
    name: "Semester 1 2026",
    periodLabel: "January to June",
    courses: [],
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
    id: ensureUuid(band.id),
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
    id: ensureUuid(item.id),
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
  const rawSubminimum = getNullableNumber(rawAssessment.subminimumPercent);

  return {
    id: ensureUuid(rawAssessment.id),
    kind: "single",
    name: getString(rawAssessment.name, `Assessment ${index + 1}`),
    weight: getNumber(rawAssessment.weight, 0),
    dueDate: getString(rawAssessment.dueDate),
    status: rawAssessment.status === "completed" ? "completed" : "ongoing",
    scoreAchieved:
      rawAssessment.scoreAchieved === null
        ? null
        : getNullableNumber(rawAssessment.scoreAchieved),
    subminimumPercent:
      rawSubminimum !== null && rawSubminimum > 0 ? rawSubminimum : null,
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
    id: ensureUuid(rawAssessment.id),
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

function normalizeCourse(rawCourse: unknown, index: number): Course {
  const course = isRecord(rawCourse) ? rawCourse : {};

  return {
    id: ensureUuid(course.id),
    code: getString(course.code, `CRS${index + 1}`),
    name: getString(course.name, `Course ${index + 1}`),
    instructor: getString(course.instructor),
    credits: getNumber(course.credits, 0),
    accent: getString(
      course.accent,
      "from-stone-950 via-stone-900 to-stone-700",
    ),
    gradeBands: getArray(course.gradeBands).map((band, bandIndex) =>
      normalizeGradeBand(band, bandIndex),
    ),
    assessments: getArray(course.assessments).map(
      (assessment, assessmentIndex) =>
        normalizeAssessment(assessment, assessmentIndex),
    ),
  };
}

function normalizeSemester(rawSemester: unknown, index: number): Semester {
  const semester = isRecord(rawSemester) ? rawSemester : {};
  const rawCourses = Array.isArray(semester.courses)
    ? semester.courses
    : Array.isArray(semester.modules)
      ? semester.modules
      : getArray(semester.courses);
  const courses = rawCourses.map((course, courseIndex) =>
    normalizeCourse(course, courseIndex),
  );

  return {
    id: ensureUuid(semester.id),
    name: getString(semester.name, `Semester ${index + 1}`),
    periodLabel: getString(semester.periodLabel),
    courses,
    // `modules` remains a local mirror for existing UI paths. `courses` is the
    // canonical model and the only collection sync code should treat as source of truth.
    modules: courses,
  };
}

function extractRawAppState(rawState: RecordValue): AppState {
  const rawSemesters = getArray(rawState.semesters);
  const selectedSemesterId = getString(rawState.selectedSemesterId);
  const normalizedSemesters = rawSemesters.map((semester, index) =>
    normalizeSemester(semester, index),
  );
  const migratedSelectedSemesterId =
    rawSemesters.reduce<string | null>((matchedId, rawSemester, index) => {
      if (matchedId) {
        return matchedId;
      }

      const semester = isRecord(rawSemester) ? rawSemester : {};
      const legacySemesterId = getString(semester.id);

      if (!legacySemesterId || legacySemesterId !== selectedSemesterId) {
        return null;
      }

      // Preserve selection when a legacy non-UUID id is normalized into a UUID.
      return normalizedSemesters[index]?.id ?? null;
    }, null) ?? selectedSemesterId;

  return {
    semesters: normalizedSemesters,
    selectedSemesterId: migratedSelectedSemesterId,
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

function normalizePersistedAppState(rawState: RecordValue) {
  return normalizeAppState(extractRawAppState(rawState));
}

export function toPersistedAppState(state: AppState): PersistedAppState {
  return {
    version: APP_STATE_VERSION,
    ...normalizeAppState(state),
  };
}

function migrateUnversionedAppState(rawState: RecordValue): PersistedAppState {
  return toPersistedAppState(normalizePersistedAppState(rawState));
}

function migrateVersion2AppState(rawState: RecordValue): PersistedAppState {
  return toPersistedAppState(normalizePersistedAppState(rawState));
}

function resolveRawAppStateVersion(rawState: RecordValue) {
  return typeof rawState.version === "number"
    ? rawState.version
    : UNVERSIONED_APP_STATE_VERSION;
}

export function validateImportedAppState(rawState: unknown) {
  return migrateAppState(rawState, true);
}

export function migrateAppState(
  rawState: unknown,
  strict = false,
): PersistedAppState {
  if (!isRecord(rawState)) {
    if (strict) {
      throw new Error(
        "This backup file does not contain a valid GradeLog state.",
      );
    }

    return toPersistedAppState(getDefaultAppState());
  }

  if (strict && !Array.isArray(rawState.semesters)) {
    throw new Error(
      "This backup file is missing the semesters data GradeLog needs.",
    );
  }

  const rawVersion = resolveRawAppStateVersion(rawState);

  if (rawVersion > APP_STATE_VERSION) {
    throw new Error(
      `This backup was created by a newer GradeLog version (${rawVersion}).`,
    );
  }

  switch (rawVersion) {
    case UNVERSIONED_APP_STATE_VERSION:
      return migrateUnversionedAppState(rawState);
    case APP_STATE_VERSION:
      return migrateVersion2AppState(rawState);
    default:
      throw new Error(`Unsupported GradeLog state version: ${rawVersion}.`);
  }
}

export function getPersistedAppStateSnapshot(state: AppState) {
  return JSON.stringify(toPersistedAppState(state));
}

export function getPersistedAppStateMetadata(
  state: AppState,
  updatedAt = new Date().toISOString(),
): PersistedAppStateMetadata {
  return {
    snapshot: getPersistedAppStateSnapshot(state),
    updatedAt,
    version: APP_STATE_VERSION,
  };
}

export function serializePersistedAppState(state: AppState) {
  return JSON.stringify(toPersistedAppState(state), null, 2);
}
