import {
  Assessment,
  AssessmentStatus,
  Course,
  GradeBand,
  GroupedAssessmentItem,
  Semester,
} from "@/lib/types";

export type DeviceId = string;
export type LamportCounter = number;
export type SyncCursor = number | null;
export type SyncOperationId = string;
export type SyncEntityType = "semester" | "course" | "assessment";
export type SyncStatus =
  | "local-only"
  | "connecting"
  | "syncing"
  | "up-to-date"
  | "offline-pending"
  | "error";

export interface SyncMetaRecord {
  connectedUserId: string | null;
  deviceId: DeviceId;
  initializedUserId: string | null;
  lamportCounter: LamportCounter;
  lastDeviceSeenAt: number | null;
  lastPulledServerOrder: SyncCursor;
  lastSyncedAt: number | null;
  lastSyncError: string | null;
  status: SyncStatus;
  syncEnabled: boolean;
}

export interface SyncOperationBase {
  clientOpId: SyncOperationId;
  deviceId: DeviceId;
  lamport: LamportCounter;
  entityType: SyncEntityType;
  entityId: string;
  parentEntityType: SyncEntityType | null;
  parentEntityId: string | null;
  fieldMask: string[];
  serverOrder: number | null;
}

export interface SyncSemesterRecord {
  id: Semester["id"];
  name: Semester["name"];
  periodLabel: Semester["periodLabel"];
}

export interface SyncCourseRecord {
  id: Course["id"];
  code: Course["code"];
  name: Course["name"];
  instructor: Course["instructor"];
  credits: Course["credits"];
  accent: Course["accent"];
  gradeBands: GradeBand[];
}

export interface AssessmentPatch {
  name?: string;
  weight?: number;
  dueDate?: string;
  status?: AssessmentStatus;
  scoreAchieved?: number | null;
  totalPossible?: number;
  category?: Assessment["category"];
  dropLowest?: number;
  items?: GroupedAssessmentItem[];
}

export interface SemesterCreateOperation extends SyncOperationBase {
  opType: "semester.create";
  entityType: "semester";
  parentEntityType: null;
  parentEntityId: null;
  fieldMask: ["name", "periodLabel"];
  payload: {
    semester: SyncSemesterRecord;
  };
}

export interface SemesterUpdateOperation extends SyncOperationBase {
  opType: "semester.update";
  entityType: "semester";
  parentEntityType: null;
  parentEntityId: null;
  payload: {
    changes: Partial<Pick<SyncSemesterRecord, "name" | "periodLabel">>;
  };
}

export interface SemesterDeleteOperation extends SyncOperationBase {
  opType: "semester.delete";
  entityType: "semester";
  parentEntityType: null;
  parentEntityId: null;
  fieldMask: [];
  payload: {};
}

export interface CourseCreateOperation extends SyncOperationBase {
  opType: "course.create";
  entityType: "course";
  parentEntityType: "semester";
  payload: {
    semesterId: string;
    course: SyncCourseRecord;
  };
}

export interface CourseUpdateOperation extends SyncOperationBase {
  opType: "course.update";
  entityType: "course";
  parentEntityType: "semester";
  payload: {
    semesterId: string;
    changes: Partial<
      Pick<
        SyncCourseRecord,
        "code" | "name" | "instructor" | "credits" | "accent" | "gradeBands"
      >
    >;
  };
}

export interface CourseDeleteOperation extends SyncOperationBase {
  opType: "course.delete";
  entityType: "course";
  parentEntityType: "semester";
  fieldMask: [];
  payload: {
    semesterId: string;
  };
}

export interface AssessmentCreateOperation extends SyncOperationBase {
  opType: "assessment.create";
  entityType: "assessment";
  parentEntityType: "course";
  payload: {
    semesterId: string;
    courseId: string;
    assessment: Assessment;
  };
}

export interface AssessmentUpdateOperation extends SyncOperationBase {
  opType: "assessment.update";
  entityType: "assessment";
  parentEntityType: "course";
  payload: {
    semesterId: string;
    courseId: string;
    changes: AssessmentPatch;
  };
}

export interface AssessmentDeleteOperation extends SyncOperationBase {
  opType: "assessment.delete";
  entityType: "assessment";
  parentEntityType: "course";
  fieldMask: [];
  payload: {
    semesterId: string;
    courseId: string;
  };
}

export interface AssessmentReorderOperation extends SyncOperationBase {
  opType: "assessment.reorder";
  entityType: "assessment";
  parentEntityType: "course";
  fieldMask: ["order"];
  payload: {
    semesterId: string;
    courseId: string;
    fromAssessmentId: string;
    toAssessmentId: string;
  };
}

export type SyncOperation =
  | SemesterCreateOperation
  | SemesterUpdateOperation
  | SemesterDeleteOperation
  | CourseCreateOperation
  | CourseUpdateOperation
  | CourseDeleteOperation
  | AssessmentCreateOperation
  | AssessmentUpdateOperation
  | AssessmentDeleteOperation
  | AssessmentReorderOperation;

export interface SyncTombstoneRecord {
  entityType: SyncEntityType;
  entityId: string;
  parentEntityType: SyncEntityType | null;
  parentEntityId: string | null;
  deletedBy: Pick<
    SyncOperationBase,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >;
}

export interface AppliedSyncOperationRecord {
  clientOpId: SyncOperationId;
  serverOrder: number | null;
}

export interface SyncOperationClock {
  clientOpId: SyncOperationId;
  deviceId: DeviceId;
  lamport: LamportCounter;
  serverOrder: number | null;
}

export interface SyncEntityVersionState {
  entityType: SyncEntityType;
  entityId: string;
  fieldClocks: Record<string, SyncOperationClock>;
}

export interface SyncMergeContext {
  tombstones: Map<string, SyncTombstoneRecord>;
  entityVersions: Map<string, SyncEntityVersionState>;
}

export interface SyncApplyResult {
  context: SyncMergeContext;
  didApply: boolean;
  reason:
    | "applied"
    | "entity-deleted"
    | "parent-deleted"
    | "entity-missing"
    | "stale-field";
  state: import("@/lib/app-state").AppState;
}
