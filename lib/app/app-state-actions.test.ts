import { describe, expect, it } from "vitest";

import {
  addAssessment,
  addCourse,
  addSemester,
  deleteAssessment,
  deleteCourse,
  deleteSemester,
  moveCourse,
  recordGrade,
  reorderAssessments,
  selectSemester,
  updateAssessment,
  updateCourse,
  updateSemester,
} from "@/lib/app/app-state-actions";
import type { AppState } from "@/lib/app/types";

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
              {
                id: "assessment-2",
                kind: "single",
                name: "Quiz 2",
                weight: 15,
                dueDate: "2026-04-18",
                status: "ongoing",
                reminder: { mode: "off" },
                scoreAchieved: null,
                subminimumPercent: null,
                totalPossible: 100,
                category: "quiz",
              },
            ],
          },
        ],
        modules: [],
      },
      {
        id: "semester-2",
        name: "Semester 2",
        periodLabel: "July to November",
        courses: [],
        modules: [],
      },
      {
        id: "semester-3",
        name: "Semester 3",
        periodLabel: "January to June",
        courses: [],
        modules: [],
      },
    ],
  };
}

describe("app-state-actions", () => {
  it("adds, updates, selects, and deletes semesters", () => {
    const added = addSemester(createState(), {
      id: "semester-3",
      name: "Semester 3",
      periodLabel: "January to June",
      courses: [],
      modules: [],
    });

    expect(added.selectedSemesterId).toBe("semester-3");
    expect(added.semesters).toHaveLength(4);

    const updated = updateSemester(added, "semester-3", {
      name: "Semester 3 Updated",
    });
    expect(updated.semesters[2]?.name).toBe("Semester 3 Updated");

    const selected = selectSemester(updated, "semester-1");
    expect(selected.selectedSemesterId).toBe("semester-1");

    const deleted = deleteSemester(selected, "semester-1");
    expect(deleted.semesters).toHaveLength(3);
    expect(deleted.selectedSemesterId).toBe("semester-2");
  });

  it("adds, updates, moves, and deletes courses while keeping modules mirrored", () => {
    const nextCourse = {
      id: "course-2",
      code: "PHY101",
      name: "Physics",
      instructor: "Prof. Chen",
      credits: 12,
      accent: "blue",
      gradeBands: [{ id: "band-2", label: "A", threshold: 80 }],
      assessments: [],
    };

    const added = addCourse(createState(), "semester-1", nextCourse);
    expect(added.semesters[0]?.courses).toHaveLength(2);
    expect(added.semesters[0]?.modules).toEqual(added.semesters[0]?.courses);

    const updated = updateCourse(added, "semester-1", "course-2", {
      name: "Physics I",
      credits: 16,
    });
    expect(updated.semesters[0]?.courses[1]).toMatchObject({
      name: "Physics I",
      credits: 16,
    });
    expect(updated.semesters[0]?.modules[1]).toMatchObject({
      name: "Physics I",
    });

    const moved = moveCourse(updated, "semester-1", "semester-2", "course-2");
    expect(moved.selectedSemesterId).toBe("semester-2");
    expect(moved.semesters[0]?.courses).toHaveLength(1);
    expect(moved.semesters[1]?.courses[0]?.id).toBe("course-2");
    expect(moved.semesters[1]?.modules).toEqual(moved.semesters[1]?.courses);
    expect(moved.semesters[2]).toEqual(updated.semesters[2]);

    const deleted = deleteCourse(moved, "semester-2", "course-2");
    expect(deleted.semesters[1]?.courses).toHaveLength(0);
    expect(deleted.semesters[1]?.modules).toEqual([]);
  });

  it("returns the original state when a course move is invalid", () => {
    const state = createState();

    expect(moveCourse(state, "semester-1", "semester-1", "course-1")).toBe(
      state,
    );
    expect(moveCourse(state, "semester-1", "missing", "course-1")).toBe(state);
    expect(moveCourse(state, "missing", "semester-2", "course-1")).toBe(state);
    expect(moveCourse(state, "semester-1", "semester-2", "missing")).toBe(
      state,
    );
  });

  it("adds, updates, reorders, deletes, and records grades for assessments", () => {
    const groupedAssessment = {
      id: "assessment-3",
      kind: "group" as const,
      name: "Tutorials",
      weight: 25,
      dueDate: "2026-05-01",
      status: "ongoing" as const,
      category: "tutorials" as const,
      dropLowest: 1,
      items: [
        {
          id: "item-1",
          label: "Tutorial 1",
          scoreAchieved: null,
          totalPossible: 10,
        },
      ],
    };

    const added = addAssessment(
      createState(),
      "semester-1",
      "course-1",
      groupedAssessment,
    );
    expect(added.semesters[0]?.courses[0]?.assessments).toHaveLength(3);

    const updatedAssessment = {
      ...groupedAssessment,
      name: "Tutorial Set",
      dropLowest: 0,
    };
    const updated = updateAssessment(
      added,
      "semester-1",
      "course-1",
      updatedAssessment,
    );
    expect(updated.semesters[0]?.courses[0]?.assessments[2]).toMatchObject({
      name: "Tutorial Set",
      dropLowest: 0,
    });

    const reordered = reorderAssessments(
      updated,
      "semester-1",
      "course-1",
      "assessment-2",
      "assessment-1",
    );
    expect(
      reordered.semesters[0]?.courses[0]?.assessments.map(
        (assessment) => assessment.id,
      ),
    ).toEqual(["assessment-2", "assessment-1", "assessment-3"]);

    const recorded = recordGrade(
      reordered,
      "semester-1",
      "course-1",
      "assessment-1",
      78,
      100,
    );
    expect(recorded.semesters[0]?.courses[0]?.assessments[1]).toMatchObject({
      scoreAchieved: 78,
      totalPossible: 100,
      status: "completed",
    });

    const unchangedGrouped = recordGrade(
      recorded,
      "semester-1",
      "course-1",
      "assessment-3",
      5,
      10,
    );
    expect(unchangedGrouped).toEqual(recorded);

    const deleted = deleteAssessment(
      unchangedGrouped,
      "semester-1",
      "course-1",
      "assessment-2",
    );
    expect(
      deleted.semesters[0]?.courses[0]?.assessments.map(
        (assessment) => assessment.id,
      ),
    ).toEqual(["assessment-1", "assessment-3"]);
  });

  it("leaves the assessment order unchanged when a reorder target is invalid", () => {
    const state = createState();

    const reordered = reorderAssessments(
      state,
      "semester-1",
      "course-1",
      "assessment-1",
      "missing",
    );

    expect(
      reordered.semesters[0]?.courses[0]?.assessments.map(
        (assessment) => assessment.id,
      ),
    ).toEqual(["assessment-1", "assessment-2"]);
    expect(reordered.semesters[0]?.modules).toEqual(
      reordered.semesters[0]?.courses,
    );
  });
});
