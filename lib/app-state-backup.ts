import {
  APP_STATE_VERSION,
  AppState,
  validateImportedAppState,
  serializePersistedAppState,
} from "@/lib/app-state";

export interface AppStateBackupSummary {
  assessmentCount: number;
  courseCount: number;
  moduleCount: number;
  semesterCount: number;
  version: number;
}

function buildBackupFileName(date = new Date()) {
  const timestamp = date.toISOString().replaceAll(":", "-");
  return `gradeflow-backup-${timestamp}.json`;
}

export function getAppStateBackupSummary(
  state: AppState,
): AppStateBackupSummary {
  return {
    assessmentCount: state.semesters.reduce(
      (count, semester) =>
        count +
        semester.courses.reduce(
          (courseCount, course) => courseCount + course.assessments.length,
          0,
        ),
      0,
    ),
    semesterCount: state.semesters.length,
    courseCount: state.semesters.reduce(
      (count, semester) => count + semester.courses.length,
      0,
    ),
    moduleCount: state.semesters.reduce(
      (count, semester) => count + semester.courses.length,
      0,
    ),
    version: APP_STATE_VERSION,
  };
}

export function downloadAppStateBackup(state: AppState) {
  const blob = new Blob([serializePersistedAppState(state)], {
    type: "application/json",
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = buildBackupFileName();
  anchor.click();

  URL.revokeObjectURL(objectUrl);
}

export async function importAppStateBackup(file: File): Promise<AppState> {
  const serializedState = await file.text();
  return validateImportedAppState(JSON.parse(serializedState));
}
