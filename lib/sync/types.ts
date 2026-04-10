import {
  Assessment,
  AssessmentStatus,
  Course,
  GradeBand,
  GroupedAssessmentItem,
  Semester,
  SingleAssessment,
} from "@/lib/shared/types";
import { AppState } from "@/lib/app/types";

export type DeviceId = string;
export type LamportCounter = number;
export type SyncCursor = number | null;
export type SyncOperationId = string;
export const SYNC_ENTITY_TYPE_SEMESTER = "semester";
export const SYNC_ENTITY_TYPE_COURSE = "course";
export const SYNC_ENTITY_TYPE_ASSESSMENT = "assessment";

export const SYNC_ENTITY_TYPES = [
  SYNC_ENTITY_TYPE_SEMESTER,
  SYNC_ENTITY_TYPE_COURSE,
  SYNC_ENTITY_TYPE_ASSESSMENT,
] as const;
export type SyncEntityType = (typeof SYNC_ENTITY_TYPES)[number];

export const SYNC_STATUS_LOCAL_ONLY = "local-only";
export const SYNC_STATUS_CONNECTING = "connecting";
export const SYNC_STATUS_SYNCING = "syncing";
export const SYNC_STATUS_UP_TO_DATE = "up-to-date";
export const SYNC_STATUS_OFFLINE_PENDING = "offline-pending";
export const SYNC_STATUS_ERROR = "error";

export const SYNC_STATUSES = [
  SYNC_STATUS_LOCAL_ONLY,
  SYNC_STATUS_CONNECTING,
  SYNC_STATUS_SYNCING,
  SYNC_STATUS_UP_TO_DATE,
  SYNC_STATUS_OFFLINE_PENDING,
  SYNC_STATUS_ERROR,
] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const SYNC_APPLY_REASON_APPLIED = "applied";
export const SYNC_APPLY_REASON_ENTITY_DELETED = "entity-deleted";
export const SYNC_APPLY_REASON_PARENT_DELETED = "parent-deleted";
export const SYNC_APPLY_REASON_ENTITY_MISSING = "entity-missing";
export const SYNC_APPLY_REASON_STALE_FIELD = "stale-field";

export const SYNC_APPLY_REASONS = [
  SYNC_APPLY_REASON_APPLIED,
  SYNC_APPLY_REASON_ENTITY_DELETED,
  SYNC_APPLY_REASON_PARENT_DELETED,
  SYNC_APPLY_REASON_ENTITY_MISSING,
  SYNC_APPLY_REASON_STALE_FIELD,
] as const;
export type SyncApplyReason = (typeof SYNC_APPLY_REASONS)[number];

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

export interface SyncAdapter {
  applyRemoteState: (state: AppState) => void;
  getAppState: () => AppState | null;
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
  subminimumPercent?: number | null;
  totalPossible?: number;
  category?: Assessment["category"];
  reminder?: SingleAssessment["reminder"];
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
  reason: SyncApplyReason;
  state: AppState;
}

export interface RemoteSyncOperationRow {
  client_op_id: string;
  created_at: string;
  device_id: string;
  entity_id: string;
  entity_type: string;
  field_mask: string[];
  id: string;
  lamport: number;
  op_type: string;
  parent_entity_id: string | null;
  parent_entity_type: string | null;
  payload: SyncOperation["payload"];
  server_order: number;
}

export interface UploadedOperationRow {
  client_op_id: string;
  id: string;
  server_order: number;
}
