import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildAssessmentCreateOperation,
  buildAssessmentDeleteOperation,
  buildAssessmentReorderOperation,
  buildAssessmentUpdateOperation,
  buildBootstrapOperations,
  buildCourseCreateOperation,
  buildCourseDeleteOperation,
  buildCourseUpdateOperation,
  buildRecordGradeOperation,
  buildSemesterCreateOperation,
  buildSemesterDeleteOperation,
  buildSemesterUpdateOperation,
} from "@/lib/sync/sync-operation-builders";
import type { AppState } from "@/lib/app/types";
import type {
  GroupedAssessment,
  SingleAssessment,
} from "@/lib/assessments/types";
import type { SyncMetaRecord } from "@/lib/sync/types";

vi.mock("@/lib/shared/uuid", () => ({
  createUuid: vi.fn(),
}));

import { createUuid } from "@/lib/shared/uuid";

function createSyncMeta(): SyncMetaRecord {
  return {
    connectedUserId: "user-1",
    deviceId: "device-1",
    initializedUserId: "user-1",
    lamportCounter: 4,
    lastDeviceSeenAt: null,
    lastPulledServerOrder: 10,
    lastSyncedAt: 1712577600000,
    lastSyncError: null,
    status: "up-to-date",
    syncEnabled: true,
  };
}

function createState(): AppState {
  return {
    selectedSemesterId: "semester-1",
    semesters: [
      {
        id: "semester-1",
        name: "Semester 1",
        periodLabel: "January to June",
        courses: [
          {
            id: "course-1",
            code: "MAT101",
            name: "Calculus",
            instructor: "Dr. Maya Patel",
            credits: 16,
            accent: "teal",
            gradeBands: [{ id: "band-1", label: "A", threshold: 80 }],
            assessments: [
              {
                id: "assessment-1",
                kind: "single",
                name: "Quiz 1",
                weight: 20,
                dueDate: "2026-04-10",
                status: "ongoing",
                reminder: { mode: "day_before" },
                scoreAchieved: null,
                subminimumPercent: 45,
                totalPossible: 100,
                category: "quiz",
              },
              {
                id: "assessment-2",
                kind: "group",
                name: "Tutorials",
                weight: 30,
                dueDate: "2026-04-24",
                status: "ongoing",
                category: "tutorials",
                dropLowest: 1,
                items: [
                  {
                    id: "item-1",
                    label: "Tutorial 1",
                    scoreAchieved: null,
                    totalPossible: 10,
                  },
                ],
              },
            ],
          },
        ],
        modules: [],
      },
    ],
  };
}

describe("sync-operation-builders", () => {
  beforeEach(() => {
    vi.mocked(createUuid).mockReset();
    vi.mocked(createUuid).mockReturnValue("generated-op-id");
  });

  it("builds semester and course operations with filtered change sets", () => {
    const syncMeta = createSyncMeta();
    const semester = createState().semesters[0]!;
    const course = semester.courses[0]!;

    const semesterCreate = buildSemesterCreateOperation(syncMeta, semester);
    expect(semesterCreate.nextMeta.lamportCounter).toBe(5);
    expect(semesterCreate.operation).toMatchObject({
      clientOpId: "generated-op-id",
      deviceId: "device-1",
      lamport: 5,
      entityType: "semester",
      opType: "semester.create",
      fieldMask: ["name", "periodLabel"],
    });

    const semesterUpdate = buildSemesterUpdateOperation(syncMeta, semester.id, {
      name: "Semester 1 Updated",
      periodLabel: undefined,
    });
    expect(semesterUpdate.operation.fieldMask).toEqual(["name"]);
    expect(semesterUpdate.operation.payload).toEqual({
      changes: { name: "Semester 1 Updated" },
    });

    const semesterDelete = buildSemesterDeleteOperation(syncMeta, semester.id);
    expect(semesterDelete.operation.fieldMask).toEqual([]);

    const courseCreate = buildCourseCreateOperation(
      syncMeta,
      semester.id,
      course,
    );
    expect(courseCreate.operation).toMatchObject({
      entityType: "course",
      opType: "course.create",
      parentEntityId: semester.id,
      fieldMask: [
        "code",
        "name",
        "instructor",
        "credits",
        "accent",
        "gradeBands",
      ],
    });

    const courseUpdate = buildCourseUpdateOperation(
      syncMeta,
      semester.id,
      course.id,
      {
        name: "Calculus I",
        credits: 18,
        instructor: undefined,
      },
    );
    expect(courseUpdate.operation.fieldMask).toEqual(["credits", "name"]);
    expect(courseUpdate.operation.payload).toEqual({
      semesterId: semester.id,
      changes: { credits: 18, name: "Calculus I" },
    });

    const courseDelete = buildCourseDeleteOperation(
      syncMeta,
      semester.id,
      course.id,
    );
    expect(courseDelete.operation.payload).toEqual({ semesterId: semester.id });
  });

  it("builds assessment operations for single and grouped assessments", () => {
    const syncMeta = createSyncMeta();
    const semester = createState().semesters[0]!;
    const course = semester.courses[0]!;
    const single = course.assessments[0]! as SingleAssessment;
    const group = course.assessments[1]! as GroupedAssessment;

    const singleCreate = buildAssessmentCreateOperation(
      syncMeta,
      semester.id,
      course.id,
      single,
    );
    expect(singleCreate.operation.fieldMask).toEqual([
      "name",
      "weight",
      "dueDate",
      "status",
      "category",
      "reminder",
      "scoreAchieved",
      "subminimumPercent",
      "totalPossible",
    ]);

    const groupCreate = buildAssessmentCreateOperation(
      syncMeta,
      semester.id,
      course.id,
      group,
    );
    expect(groupCreate.operation.fieldMask).toEqual([
      "name",
      "weight",
      "dueDate",
      "status",
      "category",
      "dropLowest",
      "items",
    ]);

    const nextSingle: SingleAssessment = {
      ...single,
      name: "Quiz 1 Updated",
      dueDate: "2026-04-12",
      weight: 25,
      reminder: { mode: "morning_of" },
      scoreAchieved: 78,
      totalPossible: 90,
      subminimumPercent: 50,
      category: "assignment",
      status: "completed",
    };

    const singleUpdate = buildAssessmentUpdateOperation(
      syncMeta,
      semester.id,
      course.id,
      single,
      nextSingle,
    );
    expect(singleUpdate.operation.fieldMask).toEqual([
      "name",
      "weight",
      "dueDate",
      "status",
      "category",
      "reminder",
      "scoreAchieved",
      "subminimumPercent",
      "totalPossible",
    ]);

    const nextGroup: GroupedAssessment = {
      ...group,
      category: "tutorials",
      dropLowest: 0,
      items: [
        ...group.items,
        {
          id: "item-2",
          label: "Tutorial 2",
          scoreAchieved: null,
          totalPossible: 10,
        },
      ],
    };

    const groupedUpdate = buildAssessmentUpdateOperation(
      syncMeta,
      semester.id,
      course.id,
      group,
      nextGroup,
    );
    expect(groupedUpdate.operation.fieldMask).toEqual(["dropLowest", "items"]);

    const deletion = buildAssessmentDeleteOperation(
      syncMeta,
      semester.id,
      course.id,
      single.id,
    );
    expect(deletion.operation.payload).toEqual({
      semesterId: semester.id,
      courseId: course.id,
    });

    const reorder = buildAssessmentReorderOperation(
      syncMeta,
      semester.id,
      course.id,
      "assessment-1",
      "assessment-2",
    );
    expect(reorder.operation.fieldMask).toEqual(["order"]);
    expect(reorder.operation.payload).toEqual({
      semesterId: semester.id,
      courseId: course.id,
      fromAssessmentId: "assessment-1",
      toAssessmentId: "assessment-2",
    });

    const recordGrade = buildRecordGradeOperation(
      syncMeta,
      semester.id,
      course.id,
      single.id,
      88,
      100,
    );
    expect(recordGrade.operation.payload).toEqual({
      semesterId: semester.id,
      courseId: course.id,
      changes: {
        scoreAchieved: 88,
        status: "completed",
        totalPossible: 100,
      },
    });
  });

  it("builds bootstrap operations in lamport order across semesters, courses, and assessments", () => {
    const syncMeta = createSyncMeta();
    const state = createState();

    vi.mocked(createUuid)
      .mockReturnValueOnce("op-1")
      .mockReturnValueOnce("op-2")
      .mockReturnValueOnce("op-3")
      .mockReturnValueOnce("op-4");

    const result = buildBootstrapOperations(syncMeta, state);

    expect(result.operations.map((operation) => operation.opType)).toEqual([
      "semester.create",
      "course.create",
      "assessment.create",
      "assessment.create",
    ]);
    expect(result.operations.map((operation) => operation.clientOpId)).toEqual([
      "op-1",
      "op-2",
      "op-3",
      "op-4",
    ]);
    expect(result.operations.map((operation) => operation.lamport)).toEqual([
      5, 6, 7, 8,
    ]);
    expect(result.nextMeta.lamportCounter).toBe(8);
  });
});
