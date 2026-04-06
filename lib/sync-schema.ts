import { Semester } from "@/lib/types";
import { SyncEntityType } from "@/lib/sync-types";
export function syncLegacySemesterMirrors(semester: Semester): Semester {
  return {
    ...semester,
    modules: semester.courses,
  };
}

export function getSyncEntityKey(entityType: SyncEntityType, entityId: string) {
  return `${entityType}:${entityId}`;
}
