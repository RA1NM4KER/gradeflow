import { AppState } from "@/lib/app/types";
import {
  AssessmentCreateOperation,
  AssessmentDeleteOperation,
  AssessmentReorderOperation,
  AssessmentUpdateOperation,
  CourseCreateOperation,
  CourseDeleteOperation,
  CourseUpdateOperation,
  SemesterCreateOperation,
  SemesterDeleteOperation,
  SemesterUpdateOperation,
  SyncMetaRecord,
  SyncOperation,
} from "@/lib/sync/types";
import { Assessment, Course, Semester } from "@/lib/shared/types";
import { createUuid } from "@/lib/shared/uuid";

function allocateOperation(
  syncMeta: SyncMetaRecord,
  operation: Omit<
    SyncOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >,
) {
  const nextLamport = syncMeta.lamportCounter + 1;

  return {
    nextMeta: {
      ...syncMeta,
      lamportCounter: nextLamport,
    },
    operation: {
      ...operation,
      clientOpId: createUuid(),
      deviceId: syncMeta.deviceId,
      lamport: nextLamport,
      serverOrder: null,
    } as SyncOperation,
  };
}

function hasMeaningfulValue(value: unknown) {
  return value !== undefined;
}

export function buildSemesterCreateOperation(
  syncMeta: SyncMetaRecord,
  semester: Semester,
) {
  return allocateOperation(syncMeta, {
    entityId: semester.id,
    entityType: "semester",
    fieldMask: ["name", "periodLabel"],
    opType: "semester.create",
    parentEntityId: null,
    parentEntityType: null,
    payload: {
      semester: {
        id: semester.id,
        name: semester.name,
        periodLabel: semester.periodLabel,
      },
    },
  } satisfies Omit<
    SemesterCreateOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

export function buildSemesterUpdateOperation(
  syncMeta: SyncMetaRecord,
  semesterId: string,
  updates: Partial<Omit<Semester, "id" | "courses" | "modules">>,
) {
  const changes = Object.fromEntries(
    Object.entries({
      name: updates.name,
      periodLabel: updates.periodLabel,
    }).filter(([, value]) => hasMeaningfulValue(value)),
  ) as SemesterUpdateOperation["payload"]["changes"];

  return allocateOperation(syncMeta, {
    entityId: semesterId,
    entityType: "semester",
    fieldMask: Object.keys(changes),
    opType: "semester.update",
    parentEntityId: null,
    parentEntityType: null,
    payload: {
      changes,
    },
  } satisfies Omit<
    SemesterUpdateOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

export function buildSemesterDeleteOperation(
  syncMeta: SyncMetaRecord,
  semesterId: string,
) {
  return allocateOperation(syncMeta, {
    entityId: semesterId,
    entityType: "semester",
    fieldMask: [],
    opType: "semester.delete",
    parentEntityId: null,
    parentEntityType: null,
    payload: {},
  } satisfies Omit<
    SemesterDeleteOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

export function buildCourseCreateOperation(
  syncMeta: SyncMetaRecord,
  semesterId: string,
  course: Course,
) {
  return allocateOperation(syncMeta, {
    entityId: course.id,
    entityType: "course",
    fieldMask: [
      "code",
      "name",
      "instructor",
      "credits",
      "accent",
      "gradeBands",
    ],
    opType: "course.create",
    parentEntityId: semesterId,
    parentEntityType: "semester",
    payload: {
      semesterId,
      course: {
        accent: course.accent,
        code: course.code,
        credits: course.credits,
        gradeBands: course.gradeBands,
        id: course.id,
        instructor: course.instructor,
        name: course.name,
      },
    },
  } satisfies Omit<
    CourseCreateOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

export function buildCourseUpdateOperation(
  syncMeta: SyncMetaRecord,
  semesterId: string,
  courseId: string,
  updates: Partial<Omit<Course, "id" | "assessments">>,
) {
  const changes = Object.fromEntries(
    Object.entries({
      accent: updates.accent,
      code: updates.code,
      credits: updates.credits,
      gradeBands: updates.gradeBands,
      instructor: updates.instructor,
      name: updates.name,
    }).filter(([, value]) => hasMeaningfulValue(value)),
  ) as CourseUpdateOperation["payload"]["changes"];

  return allocateOperation(syncMeta, {
    entityId: courseId,
    entityType: "course",
    fieldMask: Object.keys(changes),
    opType: "course.update",
    parentEntityId: semesterId,
    parentEntityType: "semester",
    payload: {
      semesterId,
      changes,
    },
  } satisfies Omit<
    CourseUpdateOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

export function buildCourseDeleteOperation(
  syncMeta: SyncMetaRecord,
  semesterId: string,
  courseId: string,
) {
  return allocateOperation(syncMeta, {
    entityId: courseId,
    entityType: "course",
    fieldMask: [],
    opType: "course.delete",
    parentEntityId: semesterId,
    parentEntityType: "semester",
    payload: {
      semesterId,
    },
  } satisfies Omit<
    CourseDeleteOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

function buildAssessmentChanges(current: Assessment, next: Assessment) {
  const changes: AssessmentUpdateOperation["payload"]["changes"] = {};

  if (current.name !== next.name) {
    changes.name = next.name;
  }
  if (current.weight !== next.weight) {
    changes.weight = next.weight;
  }
  if (current.dueDate !== next.dueDate) {
    changes.dueDate = next.dueDate;
  }
  if (current.status !== next.status) {
    changes.status = next.status;
  }
  if (current.kind !== next.kind || current.category !== next.category) {
    changes.category = next.category;
  }

  if (current.kind === "single" && next.kind === "single") {
    if (!hasMatchingReminder(current.reminder ?? null, next.reminder ?? null)) {
      changes.reminder = next.reminder ?? null;
    }
    if (current.scoreAchieved !== next.scoreAchieved) {
      changes.scoreAchieved = next.scoreAchieved;
    }
    if (current.subminimumPercent !== next.subminimumPercent) {
      changes.subminimumPercent = next.subminimumPercent;
    }
    if (current.totalPossible !== next.totalPossible) {
      changes.totalPossible = next.totalPossible;
    }
  }

  if (current.kind === "group" && next.kind === "group") {
    if (current.dropLowest !== next.dropLowest) {
      changes.dropLowest = next.dropLowest;
    }

    if (JSON.stringify(current.items) !== JSON.stringify(next.items)) {
      changes.items = next.items;
    }
  }

  return changes;
}

function hasMatchingReminder(
  current: AssessmentUpdateOperation["payload"]["changes"]["reminder"] | null,
  next: AssessmentUpdateOperation["payload"]["changes"]["reminder"] | null,
) {
  if (current === next) {
    return true;
  }

  if (!current || !next) {
    return false;
  }

  return (
    current.mode === next.mode &&
    (current.customDateTime ?? null) === (next.customDateTime ?? null)
  );
}

export function buildAssessmentCreateOperation(
  syncMeta: SyncMetaRecord,
  semesterId: string,
  courseId: string,
  assessment: Assessment,
) {
  return allocateOperation(syncMeta, {
    entityId: assessment.id,
    entityType: "assessment",
    fieldMask:
      assessment.kind === "group"
        ? [
            "name",
            "weight",
            "dueDate",
            "status",
            "category",
            "dropLowest",
            "items",
          ]
        : [
            "name",
            "weight",
            "dueDate",
            "status",
            "category",
            "reminder",
            "scoreAchieved",
            "subminimumPercent",
            "totalPossible",
          ],
    opType: "assessment.create",
    parentEntityId: courseId,
    parentEntityType: "course",
    payload: {
      semesterId,
      courseId,
      assessment,
    },
  } satisfies Omit<
    AssessmentCreateOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

export function buildAssessmentUpdateOperation(
  syncMeta: SyncMetaRecord,
  semesterId: string,
  courseId: string,
  current: Assessment,
  next: Assessment,
) {
  const changes = buildAssessmentChanges(current, next);

  return allocateOperation(syncMeta, {
    entityId: next.id,
    entityType: "assessment",
    fieldMask: Object.keys(changes),
    opType: "assessment.update",
    parentEntityId: courseId,
    parentEntityType: "course",
    payload: {
      semesterId,
      courseId,
      changes,
    },
  } satisfies Omit<
    AssessmentUpdateOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

export function buildAssessmentDeleteOperation(
  syncMeta: SyncMetaRecord,
  semesterId: string,
  courseId: string,
  assessmentId: string,
) {
  return allocateOperation(syncMeta, {
    entityId: assessmentId,
    entityType: "assessment",
    fieldMask: [],
    opType: "assessment.delete",
    parentEntityId: courseId,
    parentEntityType: "course",
    payload: {
      semesterId,
      courseId,
    },
  } satisfies Omit<
    AssessmentDeleteOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

export function buildAssessmentReorderOperation(
  syncMeta: SyncMetaRecord,
  semesterId: string,
  courseId: string,
  fromAssessmentId: string,
  toAssessmentId: string,
) {
  return allocateOperation(syncMeta, {
    entityId: fromAssessmentId,
    entityType: "assessment",
    fieldMask: ["order"],
    opType: "assessment.reorder",
    parentEntityId: courseId,
    parentEntityType: "course",
    payload: {
      semesterId,
      courseId,
      fromAssessmentId,
      toAssessmentId,
    },
  } satisfies Omit<
    AssessmentReorderOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

export function buildRecordGradeOperation(
  syncMeta: SyncMetaRecord,
  semesterId: string,
  courseId: string,
  assessmentId: string,
  scoreAchieved: number,
  totalPossible: number,
) {
  return allocateOperation(syncMeta, {
    entityId: assessmentId,
    entityType: "assessment",
    fieldMask: ["scoreAchieved", "totalPossible", "status"],
    opType: "assessment.update",
    parentEntityId: courseId,
    parentEntityType: "course",
    payload: {
      semesterId,
      courseId,
      changes: {
        scoreAchieved,
        status: "completed",
        totalPossible,
      },
    },
  } satisfies Omit<
    AssessmentUpdateOperation,
    "clientOpId" | "deviceId" | "lamport" | "serverOrder"
  >);
}

export function buildBootstrapOperations(
  syncMeta: SyncMetaRecord,
  state: AppState,
) {
  let nextMeta = syncMeta;
  const operations: SyncOperation[] = [];

  for (const semester of state.semesters) {
    const semesterCreate = buildSemesterCreateOperation(nextMeta, semester);
    nextMeta = semesterCreate.nextMeta;
    operations.push(semesterCreate.operation);

    for (const course of semester.courses) {
      const courseCreate = buildCourseCreateOperation(
        nextMeta,
        semester.id,
        course,
      );
      nextMeta = courseCreate.nextMeta;
      operations.push(courseCreate.operation);

      for (const assessment of course.assessments) {
        const assessmentCreate = buildAssessmentCreateOperation(
          nextMeta,
          semester.id,
          course.id,
          assessment,
        );
        nextMeta = assessmentCreate.nextMeta;
        operations.push(assessmentCreate.operation);
      }
    }
  }

  return {
    nextMeta,
    operations,
  };
}
