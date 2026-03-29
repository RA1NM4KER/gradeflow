import {
  AppState,
  migrateAppState,
  serializePersistedAppState,
} from "@/lib/app-state";

export interface AppStateBackupSummary {
  moduleCount: number;
  semesterCount: number;
}

function buildBackupFileName(date = new Date()) {
  const timestamp = date.toISOString().replaceAll(":", "-");
  return `gradeflow-backup-${timestamp}.json`;
}

export function getAppStateBackupSummary(
  state: AppState,
): AppStateBackupSummary {
  return {
    semesterCount: state.semesters.length,
    moduleCount: state.semesters.reduce(
      (count, semester) => count + semester.modules.length,
      0,
    ),
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
  return migrateAppState(JSON.parse(serializedState), true);
}
