import { AppState } from "@/lib/app-state";
import { syncLegacySemesterMirrors, getSyncEntityKey } from "@/lib/sync-schema";
import {
  AssessmentCreateOperation,
  AssessmentUpdateOperation,
  CourseCreateOperation,
  CourseUpdateOperation,
  SyncApplyResult,
  SyncEntityType,
  SyncMergeContext,
  SyncOperation,
  SyncOperationClock,
  SyncTombstoneRecord,
} from "@/lib/sync-types";
import { Assessment, Course, Semester } from "@/lib/types";

function cloneContext(context?: Partial<SyncMergeContext>): SyncMergeContext {
  return {
    tombstones: new Map(context?.tombstones ?? []),
    entityVersions: new Map(context?.entityVersions ?? []),
  };
}

function buildClock(operation: SyncOperation): SyncOperationClock {
  return {
    clientOpId: operation.clientOpId,
    deviceId: operation.deviceId,
    lamport: operation.lamport,
    serverOrder: operation.serverOrder,
  };
}

function compareClocks(left: SyncOperationClock, right: SyncOperationClock) {
  // Ordering is deterministic without trusting device wall clocks:
  // server order first when present, then per-device Lamport order, then stable ids.
  const leftServerOrder = left.serverOrder ?? Number.MIN_SAFE_INTEGER;
  const rightServerOrder = right.serverOrder ?? Number.MIN_SAFE_INTEGER;

  if (leftServerOrder !== rightServerOrder) {
    return leftServerOrder - rightServerOrder;
  }

  if (left.lamport !== right.lamport) {
    return left.lamport - right.lamport;
  }

  const deviceComparison = left.deviceId.localeCompare(right.deviceId);
  if (deviceComparison !== 0) {
    return deviceComparison;
  }

  return left.clientOpId.localeCompare(right.clientOpId);
}

function upsertFieldClock(
  context: SyncMergeContext,
  entityType: SyncEntityType,
  entityId: string,
  field: string,
  clock: SyncOperationClock,
) {
  const key = getSyncEntityKey(entityType, entityId);
  const currentState = context.entityVersions.get(key) ?? {
    entityId,
    entityType,
    fieldClocks: {},
  };

  currentState.fieldClocks[field] = clock;
  context.entityVersions.set(key, currentState);
}

function canApplyField(
  context: SyncMergeContext,
  entityType: SyncEntityType,
  entityId: string,
  field: string,
  nextClock: SyncOperationClock,
) {
  const key = getSyncEntityKey(entityType, entityId);
  const currentClock = context.entityVersions.get(key)?.fieldClocks[field];

  if (!currentClock) {
    return true;
  }

  return compareClocks(currentClock, nextClock) <= 0;
}

function hasTombstone(
  context: SyncMergeContext,
  entityType: SyncEntityType,
  entityId: string,
) {
  return context.tombstones.has(getSyncEntityKey(entityType, entityId));
}

function hasDeletedParent(operation: SyncOperation, context: SyncMergeContext) {
  return Boolean(
    operation.parentEntityType &&
    operation.parentEntityId &&
    hasTombstone(context, operation.parentEntityType, operation.parentEntityId),
  );
}

function createTombstone(operation: SyncOperation): SyncTombstoneRecord {
  return {
    entityType: operation.entityType,
    entityId: operation.entityId,
    parentEntityType: operation.parentEntityType,
    parentEntityId: operation.parentEntityId,
    deletedBy: {
      clientOpId: operation.clientOpId,
      deviceId: operation.deviceId,
      lamport: operation.lamport,
      serverOrder: operation.serverOrder,
    },
  };
}

function mapSemesters(
  state: AppState,
  update: (semester: Semester) => Semester,
): AppState {
  return {
    ...state,
    semesters: state.semesters.map((semester) =>
      syncLegacySemesterMirrors(update(semester)),
    ),
  };
}

function updateSemesterById(
  state: AppState,
  semesterId: string,
  update: (semester: Semester) => Semester,
) {
  return mapSemesters(state, (semester) =>
    semester.id === semesterId ? update(semester) : semester,
  );
}

function updateCourseById(
  state: AppState,
  semesterId: string,
  courseId: string,
  update: (course: Course) => Course,
) {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    courses: semester.courses.map((course) =>
      course.id === courseId ? update(course) : course,
    ),
  }));
}

function findSemester(state: AppState, semesterId: string) {
  return state.semesters.find((semester) => semester.id === semesterId) ?? null;
}

function findCourse(state: AppState, semesterId: string, courseId: string) {
  return (
    state.semesters
      .find((semester) => semester.id === semesterId)
      ?.courses.find((course) => course.id === courseId) ?? null
  );
}

function patchCourse(
  course: Course,
  operation: CourseUpdateOperation,
  context: SyncMergeContext,
) {
  const nextClock = buildClock(operation);
  const nextCourse = { ...course };
  let didApplyAnyField = false;

  // Different fields can merge independently. The same field uses deterministic
  // last-op-wins through `compareClocks`.
  for (const field of operation.fieldMask) {
    if (!canApplyField(context, "course", course.id, field, nextClock)) {
      continue;
    }

    const value =
      operation.payload.changes[
        field as keyof typeof operation.payload.changes
      ];
    if (value === undefined) {
      continue;
    }

    (nextCourse as Record<string, unknown>)[field] = value;
    upsertFieldClock(context, "course", course.id, field, nextClock);
    didApplyAnyField = true;
  }

  return {
    course: nextCourse,
    didApplyAnyField,
  };
}

function patchAssessment(
  assessment: Assessment,
  operation: AssessmentUpdateOperation,
  context: SyncMergeContext,
) {
  const nextClock = buildClock(operation);
  const nextAssessment = { ...assessment } as Assessment;
  let didApplyAnyField = false;

  // Different fields can merge independently. The same field uses deterministic
  // last-op-wins through `compareClocks`.
  for (const field of operation.fieldMask) {
    if (
      !canApplyField(context, "assessment", assessment.id, field, nextClock)
    ) {
      continue;
    }

    const value =
      operation.payload.changes[
        field as keyof typeof operation.payload.changes
      ];

    if (value === undefined) {
      continue;
    }

    (nextAssessment as unknown as Record<string, unknown>)[field] = value;
    upsertFieldClock(context, "assessment", assessment.id, field, nextClock);
    didApplyAnyField = true;
  }

  return {
    assessment: nextAssessment,
    didApplyAnyField,
  };
}

function applyCourseCreate(state: AppState, operation: CourseCreateOperation) {
  const semester = findSemester(state, operation.payload.semesterId);

  if (!semester) {
    return null;
  }

  return updateSemesterById(state, operation.payload.semesterId, (current) => ({
    ...current,
    courses: [
      ...current.courses,
      { ...operation.payload.course, assessments: [] },
    ],
  }));
}

function applyAssessmentCreate(
  state: AppState,
  operation: AssessmentCreateOperation,
) {
  const course = findCourse(
    state,
    operation.payload.semesterId,
    operation.payload.courseId,
  );

  if (!course) {
    return null;
  }

  return updateCourseById(
    state,
    operation.payload.semesterId,
    operation.payload.courseId,
    (current) => ({
      ...current,
      assessments: [...current.assessments, operation.payload.assessment],
    }),
  );
}

function finishApply(
  state: AppState,
  context: SyncMergeContext,
  didApply: boolean,
  reason: SyncApplyResult["reason"],
): SyncApplyResult {
  return {
    context,
    didApply,
    reason,
    state,
  };
}

function applyOperation(
  state: AppState,
  operation: SyncOperation,
  context: SyncMergeContext,
) {
  // Delete wins over later updates to the same entity.
  if (hasTombstone(context, operation.entityType, operation.entityId)) {
    return finishApply(state, context, false, "entity-deleted");
  }

  // A deleted parent suppresses child updates and child creates.
  if (hasDeletedParent(operation, context)) {
    return finishApply(state, context, false, "parent-deleted");
  }

  switch (operation.opType) {
    case "semester.create": {
      const nextState = {
        ...state,
        semesters: [
          ...state.semesters,
          syncLegacySemesterMirrors({
            ...operation.payload.semester,
            courses: [],
            modules: [],
          }),
        ],
      };
      return finishApply(nextState, context, true, "applied");
    }
    case "semester.update": {
      const semester = findSemester(state, operation.entityId);

      if (!semester) {
        return finishApply(state, context, false, "entity-missing");
      }

      const nextClock = buildClock(operation);
      let didApplyAnyField = false;

      const nextState = updateSemesterById(
        state,
        operation.entityId,
        (current) => {
          const nextSemester = { ...current };

          for (const field of operation.fieldMask) {
            if (
              !canApplyField(context, "semester", current.id, field, nextClock)
            ) {
              continue;
            }

            const value =
              operation.payload.changes[
                field as keyof typeof operation.payload.changes
              ];

            if (value === undefined) {
              continue;
            }

            (nextSemester as Record<string, unknown>)[field] = value;
            upsertFieldClock(context, "semester", current.id, field, nextClock);
            didApplyAnyField = true;
          }

          return nextSemester;
        },
      );

      return finishApply(
        nextState,
        context,
        didApplyAnyField,
        didApplyAnyField ? "applied" : "stale-field",
      );
    }
    case "semester.delete": {
      context.tombstones.set(
        getSyncEntityKey(operation.entityType, operation.entityId),
        createTombstone(operation),
      );

      const nextState = {
        ...state,
        semesters: state.semesters.filter(
          (semester) => semester.id !== operation.entityId,
        ),
      };

      return finishApply(nextState, context, true, "applied");
    }
    case "course.create": {
      const nextState = applyCourseCreate(state, operation);
      return nextState
        ? finishApply(nextState, context, true, "applied")
        : finishApply(state, context, false, "entity-missing");
    }
    case "course.update": {
      const course = findCourse(
        state,
        operation.payload.semesterId,
        operation.entityId,
      );

      if (!course) {
        return finishApply(state, context, false, "entity-missing");
      }

      let didApplyAnyField = false;

      const nextState = updateCourseById(
        state,
        operation.payload.semesterId,
        operation.entityId,
        (current) => {
          const result = patchCourse(current, operation, context);
          didApplyAnyField = result.didApplyAnyField;
          return result.course;
        },
      );

      return finishApply(
        nextState,
        context,
        didApplyAnyField,
        didApplyAnyField ? "applied" : "stale-field",
      );
    }
    case "course.delete": {
      context.tombstones.set(
        getSyncEntityKey(operation.entityType, operation.entityId),
        createTombstone(operation),
      );

      const nextState = updateSemesterById(
        state,
        operation.payload.semesterId,
        (semester) => ({
          ...semester,
          courses: semester.courses.filter(
            (course) => course.id !== operation.entityId,
          ),
        }),
      );

      return finishApply(nextState, context, true, "applied");
    }
    case "assessment.create": {
      const nextState = applyAssessmentCreate(state, operation);
      return nextState
        ? finishApply(nextState, context, true, "applied")
        : finishApply(state, context, false, "entity-missing");
    }
    case "assessment.update": {
      const course = findCourse(
        state,
        operation.payload.semesterId,
        operation.payload.courseId,
      );

      if (!course) {
        return finishApply(state, context, false, "entity-missing");
      }

      let didApplyAnyField = false;

      const nextState = updateCourseById(
        state,
        operation.payload.semesterId,
        operation.payload.courseId,
        (currentCourse) => ({
          ...currentCourse,
          assessments: currentCourse.assessments.map((assessment) => {
            if (assessment.id !== operation.entityId) {
              return assessment;
            }

            const result = patchAssessment(assessment, operation, context);
            didApplyAnyField = result.didApplyAnyField;
            return result.assessment;
          }),
        }),
      );

      return finishApply(
        nextState,
        context,
        didApplyAnyField,
        didApplyAnyField ? "applied" : "stale-field",
      );
    }
    case "assessment.delete": {
      context.tombstones.set(
        getSyncEntityKey(operation.entityType, operation.entityId),
        createTombstone(operation),
      );

      const nextState = updateCourseById(
        state,
        operation.payload.semesterId,
        operation.payload.courseId,
        (course) => ({
          ...course,
          assessments: course.assessments.filter(
            (assessment) => assessment.id !== operation.entityId,
          ),
        }),
      );

      return finishApply(nextState, context, true, "applied");
    }
    case "assessment.reorder": {
      const course = findCourse(
        state,
        operation.payload.semesterId,
        operation.payload.courseId,
      );

      if (!course) {
        return finishApply(state, context, false, "entity-missing");
      }

      const nextState = updateCourseById(
        state,
        operation.payload.semesterId,
        operation.payload.courseId,
        (current) => {
          const assessments = [...current.assessments];
          const fromIndex = assessments.findIndex(
            (assessment) =>
              assessment.id === operation.payload.fromAssessmentId,
          );
          const toIndex = assessments.findIndex(
            (assessment) => assessment.id === operation.payload.toAssessmentId,
          );

          if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
            return current;
          }

          const [moved] = assessments.splice(fromIndex, 1);
          assessments.splice(toIndex, 0, moved);

          return {
            ...current,
            assessments,
          };
        },
      );

      return finishApply(nextState, context, true, "applied");
    }
  }
}

export function createEmptySyncMergeContext(): SyncMergeContext {
  return {
    tombstones: new Map(),
    entityVersions: new Map(),
  };
}

export function applyLocalSyncOperation(
  state: AppState,
  operation: SyncOperation,
  context: Partial<SyncMergeContext> = {},
) {
  return applyOperation(state, operation, cloneContext(context));
}

export function applyRemoteSyncOperation(
  state: AppState,
  operation: SyncOperation,
  context: Partial<SyncMergeContext> = {},
) {
  return applyOperation(state, operation, cloneContext(context));
}
