import { describe, expect, it } from "vitest";

import type { AppState } from "@/lib/app/types";
import {
  applyLocalSyncOperation,
  applyRemoteSyncOperation,
} from "@/lib/sync/sync-reducer";
import { getSyncEntityKey } from "@/lib/sync/sync-schema";
import type { SyncMergeContext } from "@/lib/sync/types";

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
                subminimumPercent: null,
                totalPossible: 100,
                category: "assignment",
              },
            ],
          },
        ],
        modules: [],
      },
    ],
  };
}

function createContext(
  overrides?: Partial<SyncMergeContext>,
): Partial<SyncMergeContext> {
  return {
    entityVersions: new Map(overrides?.entityVersions ?? []),
    tombstones: new Map(overrides?.tombstones ?? []),
  };
}

describe("sync-reducer", () => {
  it("creates, updates, and deletes semesters", () => {
    const createResult = applyLocalSyncOperation(
      createState(),
      {
        opType: "semester.create",
        clientOpId: "op-1",
        deviceId: "device-a",
        lamport: 1,
        serverOrder: null,
        entityType: "semester",
        entityId: "semester-2",
        parentEntityType: null,
        parentEntityId: null,
        fieldMask: ["name", "periodLabel"],
        payload: {
          semester: {
            id: "semester-2",
            name: "Semester 2",
            periodLabel: "July to November",
          },
        },
      },
      createContext(),
    );

    expect(createResult.reason).toBe("applied");
    expect(createResult.didApply).toBe(true);
    expect(createResult.state.semesters).toHaveLength(2);
    expect(createResult.state.semesters[1]?.modules).toBe(
      createResult.state.semesters[1]?.courses,
    );

    const updateResult = applyRemoteSyncOperation(
      createResult.state,
      {
        opType: "semester.update",
        clientOpId: "op-2",
        deviceId: "device-a",
        lamport: 2,
        serverOrder: 2,
        entityType: "semester",
        entityId: "semester-2",
        parentEntityType: null,
        parentEntityId: null,
        fieldMask: ["name"],
        payload: {
          changes: { name: "Semester 2 Updated" },
        },
      },
      createResult.context,
    );

    expect(updateResult.reason).toBe("applied");
    expect(updateResult.state.semesters[1]?.name).toBe("Semester 2 Updated");

    const deleteResult = applyRemoteSyncOperation(
      updateResult.state,
      {
        opType: "semester.delete",
        clientOpId: "op-3",
        deviceId: "device-a",
        lamport: 3,
        serverOrder: 3,
        entityType: "semester",
        entityId: "semester-2",
        parentEntityType: null,
        parentEntityId: null,
        fieldMask: [],
        payload: {},
      },
      updateResult.context,
    );

    expect(deleteResult.reason).toBe("applied");
    expect(deleteResult.state.semesters).toHaveLength(1);
    expect(
      deleteResult.context.tombstones.get(
        getSyncEntityKey("semester", "semester-2"),
      ),
    ).toBeDefined();
  });

  it("rejects stale field updates using field clocks", () => {
    const result = applyRemoteSyncOperation(
      createState(),
      {
        opType: "course.update",
        clientOpId: "op-stale",
        deviceId: "device-a",
        lamport: 1,
        serverOrder: 1,
        entityType: "course",
        entityId: "course-1",
        parentEntityType: "semester",
        parentEntityId: "semester-1",
        fieldMask: ["name"],
        payload: {
          semesterId: "semester-1",
          changes: { name: "Old name" },
        },
      },
      createContext({
        entityVersions: new Map([
          [
            getSyncEntityKey("course", "course-1"),
            {
              entityId: "course-1",
              entityType: "course",
              fieldClocks: {
                name: {
                  clientOpId: "op-newer",
                  deviceId: "device-z",
                  lamport: 9,
                  serverOrder: 9,
                },
              },
            },
          ],
        ]),
      }),
    );

    expect(result.didApply).toBe(false);
    expect(result.reason).toBe("stale-field");
    expect(result.state.semesters[0]?.courses[0]?.name).toBe("Calculus");
  });

  it("creates, updates, reorders, and deletes assessments", () => {
    const created = applyLocalSyncOperation(
      createState(),
      {
        opType: "assessment.create",
        clientOpId: "op-a1",
        deviceId: "device-a",
        lamport: 1,
        serverOrder: null,
        entityType: "assessment",
        entityId: "assessment-2",
        parentEntityType: "course",
        parentEntityId: "course-1",
        fieldMask: [],
        payload: {
          semesterId: "semester-1",
          courseId: "course-1",
          assessment: {
            id: "assessment-2",
            kind: "single",
            name: "Quiz 2",
            weight: 10,
            dueDate: "2026-04-20",
            status: "ongoing",
            reminder: { mode: "morning_of" },
            scoreAchieved: null,
            subminimumPercent: null,
            totalPossible: 100,
            category: "quiz",
          },
        },
      },
      createContext(),
    );

    expect(created.reason).toBe("applied");
    expect(created.state.semesters[0]?.courses[0]?.assessments).toHaveLength(2);

    const updated = applyRemoteSyncOperation(
      created.state,
      {
        opType: "assessment.update",
        clientOpId: "op-a2",
        deviceId: "device-a",
        lamport: 2,
        serverOrder: 2,
        entityType: "assessment",
        entityId: "assessment-2",
        parentEntityType: "course",
        parentEntityId: "course-1",
        fieldMask: ["name", "weight"],
        payload: {
          semesterId: "semester-1",
          courseId: "course-1",
          changes: {
            name: "Quiz 2 Updated",
            weight: 15,
          },
        },
      },
      created.context,
    );

    expect(updated.reason).toBe("applied");
    expect(
      updated.state.semesters[0]?.courses[0]?.assessments[1],
    ).toMatchObject({
      name: "Quiz 2 Updated",
      weight: 15,
    });

    const reordered = applyRemoteSyncOperation(
      updated.state,
      {
        opType: "assessment.reorder",
        clientOpId: "op-a3",
        deviceId: "device-a",
        lamport: 3,
        serverOrder: 3,
        entityType: "assessment",
        entityId: "assessment-2",
        parentEntityType: "course",
        parentEntityId: "course-1",
        fieldMask: ["order"],
        payload: {
          semesterId: "semester-1",
          courseId: "course-1",
          fromAssessmentId: "assessment-2",
          toAssessmentId: "assessment-1",
        },
      },
      updated.context,
    );

    expect(reordered.reason).toBe("applied");
    expect(
      reordered.state.semesters[0]?.courses[0]?.assessments.map(
        (item) => item.id,
      ),
    ).toEqual(["assessment-2", "assessment-1"]);

    const deleted = applyRemoteSyncOperation(
      reordered.state,
      {
        opType: "assessment.delete",
        clientOpId: "op-a4",
        deviceId: "device-a",
        lamport: 4,
        serverOrder: 4,
        entityType: "assessment",
        entityId: "assessment-2",
        parentEntityType: "course",
        parentEntityId: "course-1",
        fieldMask: [],
        payload: {
          semesterId: "semester-1",
          courseId: "course-1",
        },
      },
      reordered.context,
    );

    expect(deleted.reason).toBe("applied");
    expect(deleted.state.semesters[0]?.courses[0]?.assessments).toHaveLength(1);
    expect(
      deleted.context.tombstones.get(
        getSyncEntityKey("assessment", "assessment-2"),
      ),
    ).toBeDefined();
  });

  it("returns entity-missing when parent entities cannot be found", () => {
    const missingCourse = applyLocalSyncOperation(
      createState(),
      {
        opType: "assessment.create",
        clientOpId: "op-missing",
        deviceId: "device-a",
        lamport: 1,
        serverOrder: null,
        entityType: "assessment",
        entityId: "assessment-x",
        parentEntityType: "course",
        parentEntityId: "missing-course",
        fieldMask: [],
        payload: {
          semesterId: "semester-1",
          courseId: "missing-course",
          assessment: {
            id: "assessment-x",
            kind: "single",
            name: "Quiz X",
            weight: 10,
            dueDate: "2026-04-20",
            status: "ongoing",
            scoreAchieved: null,
            subminimumPercent: null,
            totalPossible: 100,
            category: "quiz",
          },
        },
      },
      createContext(),
    );

    expect(missingCourse.didApply).toBe(false);
    expect(missingCourse.reason).toBe("entity-missing");

    const missingSemester = applyRemoteSyncOperation(
      createState(),
      {
        opType: "course.create",
        clientOpId: "op-missing-sem",
        deviceId: "device-a",
        lamport: 1,
        serverOrder: null,
        entityType: "course",
        entityId: "course-x",
        parentEntityType: "semester",
        parentEntityId: "missing-semester",
        fieldMask: [],
        payload: {
          semesterId: "missing-semester",
          course: {
            id: "course-x",
            code: "PHY101",
            name: "Physics",
            instructor: "Dr. Lee",
            credits: 16,
            accent: "teal",
            gradeBands: [],
          },
        },
      },
      createContext(),
    );

    expect(missingSemester.reason).toBe("entity-missing");
  });

  it("suppresses operations when the entity or parent has already been deleted", () => {
    const deletedEntity = applyRemoteSyncOperation(
      createState(),
      {
        opType: "course.update",
        clientOpId: "op-deleted",
        deviceId: "device-a",
        lamport: 4,
        serverOrder: 4,
        entityType: "course",
        entityId: "course-1",
        parentEntityType: "semester",
        parentEntityId: "semester-1",
        fieldMask: ["name"],
        payload: {
          semesterId: "semester-1",
          changes: { name: "New name" },
        },
      },
      createContext({
        tombstones: new Map([
          [
            getSyncEntityKey("course", "course-1"),
            {
              entityType: "course",
              entityId: "course-1",
              parentEntityType: "semester",
              parentEntityId: "semester-1",
              deletedBy: {
                clientOpId: "op-delete",
                deviceId: "device-a",
                lamport: 3,
                serverOrder: 3,
              },
            },
          ],
        ]),
      }),
    );

    expect(deletedEntity.reason).toBe("entity-deleted");
    expect(deletedEntity.didApply).toBe(false);

    const deletedParent = applyRemoteSyncOperation(
      createState(),
      {
        opType: "assessment.create",
        clientOpId: "op-parent-deleted",
        deviceId: "device-a",
        lamport: 5,
        serverOrder: 5,
        entityType: "assessment",
        entityId: "assessment-2",
        parentEntityType: "course",
        parentEntityId: "course-1",
        fieldMask: [],
        payload: {
          semesterId: "semester-1",
          courseId: "course-1",
          assessment: {
            id: "assessment-2",
            kind: "single",
            name: "Quiz 2",
            weight: 10,
            dueDate: "2026-04-20",
            status: "ongoing",
            scoreAchieved: null,
            subminimumPercent: null,
            totalPossible: 100,
            category: "quiz",
          },
        },
      },
      createContext({
        tombstones: new Map([
          [
            getSyncEntityKey("course", "course-1"),
            {
              entityType: "course",
              entityId: "course-1",
              parentEntityType: "semester",
              parentEntityId: "semester-1",
              deletedBy: {
                clientOpId: "op-delete-parent",
                deviceId: "device-a",
                lamport: 4,
                serverOrder: 4,
              },
            },
          ],
        ]),
      }),
    );

    expect(deletedParent.reason).toBe("parent-deleted");
    expect(deletedParent.didApply).toBe(false);
  });

  it("treats missing assessment update fields as stale and preserves state", () => {
    const state = createState();

    const result = applyRemoteSyncOperation(
      state,
      {
        opType: "assessment.update",
        clientOpId: "op-stale-assessment",
        deviceId: "device-a",
        lamport: 6,
        serverOrder: 6,
        entityType: "assessment",
        entityId: "assessment-1",
        parentEntityType: "course",
        parentEntityId: "course-1",
        fieldMask: ["name"],
        payload: {
          semesterId: "semester-1",
          courseId: "course-1",
          changes: {},
        },
      },
      createContext(),
    );

    expect(result.reason).toBe("stale-field");
    expect(result.didApply).toBe(false);
    expect(result.state.semesters[0]?.courses[0]?.assessments[0]?.name).toBe(
      "Quiz 1",
    );
    expect(result.state.semesters[0]?.modules).toEqual(
      result.state.semesters[0]?.courses,
    );
  });

  it("returns entity-missing for course and assessment updates when the target cannot be found", () => {
    const missingCourseUpdate = applyRemoteSyncOperation(
      createState(),
      {
        opType: "course.update",
        clientOpId: "op-course-missing",
        deviceId: "device-a",
        lamport: 7,
        serverOrder: 7,
        entityType: "course",
        entityId: "missing-course",
        parentEntityType: "semester",
        parentEntityId: "semester-1",
        fieldMask: ["name"],
        payload: {
          semesterId: "semester-1",
          changes: { name: "Ghost course" },
        },
      },
      createContext(),
    );

    const missingAssessmentUpdate = applyRemoteSyncOperation(
      createState(),
      {
        opType: "assessment.update",
        clientOpId: "op-assessment-missing",
        deviceId: "device-a",
        lamport: 8,
        serverOrder: 8,
        entityType: "assessment",
        entityId: "assessment-404",
        parentEntityType: "course",
        parentEntityId: "course-1",
        fieldMask: ["name"],
        payload: {
          semesterId: "semester-1",
          courseId: "missing-course",
          changes: { name: "Ghost assessment" },
        },
      },
      createContext(),
    );

    expect(missingCourseUpdate.reason).toBe("entity-missing");
    expect(missingAssessmentUpdate.reason).toBe("entity-missing");
  });

  it("applies course deletes and harmless reorder no-ops while preserving mirrors", () => {
    const deletedCourse = applyRemoteSyncOperation(
      createState(),
      {
        opType: "course.delete",
        clientOpId: "op-course-delete",
        deviceId: "device-a",
        lamport: 9,
        serverOrder: 9,
        entityType: "course",
        entityId: "course-1",
        parentEntityType: "semester",
        parentEntityId: "semester-1",
        fieldMask: [],
        payload: {
          semesterId: "semester-1",
        },
      },
      createContext(),
    );

    expect(deletedCourse.reason).toBe("applied");
    expect(deletedCourse.state.semesters[0]?.courses).toEqual([]);
    expect(deletedCourse.state.semesters[0]?.modules).toEqual([]);

    const noopReorder = applyRemoteSyncOperation(
      createState(),
      {
        opType: "assessment.reorder",
        clientOpId: "op-reorder-noop",
        deviceId: "device-a",
        lamport: 10,
        serverOrder: 10,
        entityType: "assessment",
        entityId: "assessment-1",
        parentEntityType: "course",
        parentEntityId: "course-1",
        fieldMask: ["order"],
        payload: {
          semesterId: "semester-1",
          courseId: "course-1",
          fromAssessmentId: "assessment-1",
          toAssessmentId: "assessment-1",
        },
      },
      createContext(),
    );

    expect(noopReorder.reason).toBe("applied");
    expect(
      noopReorder.state.semesters[0]?.courses[0]?.assessments.map(
        (assessment) => assessment.id,
      ),
    ).toEqual(["assessment-1"]);
    expect(noopReorder.state.semesters[0]?.modules).toEqual(
      noopReorder.state.semesters[0]?.courses,
    );
  });

  it("merges later field clocks for assessments and semesters independently", () => {
    const semesterResult = applyRemoteSyncOperation(
      createState(),
      {
        opType: "semester.update",
        clientOpId: "op-semester-late",
        deviceId: "device-z",
        lamport: 20,
        serverOrder: 20,
        entityType: "semester",
        entityId: "semester-1",
        parentEntityType: null,
        parentEntityId: null,
        fieldMask: ["name", "periodLabel"],
        payload: {
          changes: {
            name: "Semester Renamed",
            periodLabel: "February to June",
          },
        },
      },
      createContext({
        entityVersions: new Map([
          [
            getSyncEntityKey("semester", "semester-1"),
            {
              entityId: "semester-1",
              entityType: "semester",
              fieldClocks: {
                name: {
                  clientOpId: "older",
                  deviceId: "device-a",
                  lamport: 1,
                  serverOrder: 1,
                },
              },
            },
          ],
        ]),
      }),
    );

    expect(semesterResult.reason).toBe("applied");
    expect(semesterResult.state.semesters[0]).toMatchObject({
      name: "Semester Renamed",
      periodLabel: "February to June",
    });

    const assessmentResult = applyRemoteSyncOperation(
      createState(),
      {
        opType: "assessment.update",
        clientOpId: "op-assessment-late",
        deviceId: "device-z",
        lamport: 21,
        serverOrder: 21,
        entityType: "assessment",
        entityId: "assessment-1",
        parentEntityType: "course",
        parentEntityId: "course-1",
        fieldMask: ["name", "weight"],
        payload: {
          semesterId: "semester-1",
          courseId: "course-1",
          changes: {
            name: "Quiz 1 Final",
            weight: 25,
          },
        },
      },
      createContext({
        entityVersions: new Map([
          [
            getSyncEntityKey("assessment", "assessment-1"),
            {
              entityId: "assessment-1",
              entityType: "assessment",
              fieldClocks: {
                name: {
                  clientOpId: "older",
                  deviceId: "device-a",
                  lamport: 1,
                  serverOrder: 1,
                },
              },
            },
          ],
        ]),
      }),
    );

    expect(assessmentResult.reason).toBe("applied");
    expect(
      assessmentResult.state.semesters[0]?.courses[0]?.assessments[0],
    ).toMatchObject({
      name: "Quiz 1 Final",
      weight: 25,
    });
  });
});
