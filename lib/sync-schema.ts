import { Semester } from "@/lib/types";
import { SyncEntityType } from "@/lib/sync-types";

export const CANONICAL_SYNCED_ENTITY_TYPES = [
  "semester",
  "course",
  "assessment",
] as const satisfies readonly SyncEntityType[];

export function syncLegacySemesterMirrors(semester: Semester): Semester {
  return {
    ...semester,
    modules: semester.courses,
  };
}

export function getSyncEntityKey(entityType: SyncEntityType, entityId: string) {
  return `${entityType}:${entityId}`;
}
