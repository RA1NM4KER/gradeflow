import { describe, expect, it } from "vitest";

import {
  APP_STATE_VERSION,
  getDefaultAppState,
  getPersistedAppStateMetadata,
  getPersistedAppStateSnapshot,
  migrateAppState,
  normalizeAppState,
  serializePersistedAppState,
  toPersistedAppState,
  validateImportedAppState,
} from "@/lib/app/app-state";

describe("app-state", () => {
  it("falls back to the default state when normalization input is empty", () => {
    const normalized = normalizeAppState(null);

    expect(normalized.semesters).toHaveLength(1);
    expect(normalized.selectedSemesterId).toBe(normalized.semesters[0]?.id);
    expect(normalized.semesters[0]?.modules).toEqual(
      normalized.semesters[0]?.courses,
    );
  });

  it("migrates legacy persisted state and preserves selection through UUID normalization", () => {
    const migrated = migrateAppState({
      selectedSemesterId: "legacy-sem-1",
      semesters: [
        {
          id: "legacy-sem-1",
          name: "Semester 1 2026",
          periodLabel: "January to June",
          modules: [
            {
              id: "legacy-course-1",
              code: "MAT101",
              name: "Calculus I",
              instructor: "Dr. Maya Patel",
              credits: 16,
              accent: "teal",
              gradeBands: [{ id: "legacy-band-1", label: "A", threshold: 80 }],
              assessments: [
                {
                  id: "legacy-assessment-1",
                  kind: "single",
                  name: "Quiz 1",
                  weight: 20,
                  dueDate: "2026-04-10",
                  scoreAchieved: null,
                  totalPossible: 100,
                  subminimumPercent: 0,
                  category: "assignment",
                },
                {
                  id: "legacy-group-1",
                  category: "tutorials",
                  name: "Tutorials",
                  weight: 30,
                  dueDate: "Category series",
                  dropLowest: 1,
                  items: [
                    {
                      id: "legacy-item-1",
                      label: "Tutorial 1",
                      scoreAchieved: null,
                      totalPossible: 10,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(migrated.version).toBe(APP_STATE_VERSION);
    expect(migrated.semesters).toHaveLength(1);
    expect(migrated.selectedSemesterId).toBe(migrated.semesters[0]?.id);

    const semester = migrated.semesters[0]!;
    const course = semester.courses[0]!;
    expect(semester.modules).toBe(semester.courses);
    expect(course.id).not.toBe("legacy-course-1");
    expect(course.gradeBands[0]?.id).not.toBe("legacy-band-1");
    expect(course.assessments[0]).toMatchObject({
      kind: "single",
      status: "ongoing",
      category: "assignment",
      subminimumPercent: null,
      reminder: { mode: "day_before" },
    });
    expect(course.assessments[1]).toMatchObject({
      kind: "group",
      category: "tutorials",
      status: "ongoing",
    });
  });

  it("validates strict imported state and rejects malformed backups", () => {
    const validState = validateImportedAppState({
      version: APP_STATE_VERSION,
      selectedSemesterId: "semester-1",
      semesters: [
        {
          id: "semester-1",
          name: "Semester 1",
          periodLabel: "January to June",
          courses: [],
        },
      ],
    });

    expect(validState.version).toBe(APP_STATE_VERSION);
    expect(() => validateImportedAppState({ semesters: "bad" })).toThrow(
      "This backup file does not contain a valid GradeLog state.",
    );
    expect(() =>
      migrateAppState({ version: APP_STATE_VERSION + 1, semesters: [] }, true),
    ).toThrow(
      `This backup was created by a newer GradeLog version (${APP_STATE_VERSION + 1}).`,
    );
    expect(() => migrateAppState({}, true)).toThrow(
      "This backup file is missing the semesters data GradeLog needs.",
    );
  });

  it("serializes persisted state consistently", () => {
    const defaultState = getDefaultAppState();
    const persisted = toPersistedAppState(defaultState);
    const snapshot = getPersistedAppStateSnapshot(defaultState);
    const metadata = getPersistedAppStateMetadata(
      defaultState,
      "2026-04-08T10:00:00.000Z",
    );

    expect(persisted.version).toBe(APP_STATE_VERSION);
    expect(JSON.parse(snapshot)).toEqual(persisted);
    expect(metadata).toEqual({
      snapshot,
      updatedAt: "2026-04-08T10:00:00.000Z",
      version: APP_STATE_VERSION,
    });
    expect(JSON.parse(serializePersistedAppState(defaultState))).toEqual(
      persisted,
    );
  });
});
