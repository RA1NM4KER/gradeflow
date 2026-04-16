import { describe, expect, it } from "vitest";

import {
  ASSESSMENT_KIND_GROUP,
  ASSESSMENT_KIND_SINGLE,
  ASSESSMENT_STATUS_COMPLETED,
  ASSESSMENT_STATUS_ONGOING,
  GROUPED_ASSESSMENT_CATEGORY,
  SINGLE_ASSESSMENT_CATEGORY,
} from "@/lib/assessments/types";
import type { Course } from "@/lib/course/types";
import {
  GRADE_BAND_STATE_GUARANTEED,
  GRADE_BAND_STATE_REACHABLE,
  GRADE_BAND_STATE_UNREACHABLE,
} from "@/lib/grades/types";
import type { GroupedAssessment } from "@/lib/shared/types";
import {
  formatEditablePercent,
  formatPercent,
  getAssessmentCurrentWeight,
  getAssessmentPace,
  getAssessmentPercent,
  getAssessmentRemainingWeight,
  getAssessmentStatus,
  getAssessmentWeightedContribution,
  calculateRequiredScore,
  getAssignedWeight,
  getCourseGuaranteedGrade,
  getCourseCurrentGrade,
  getCourseSubminimumRequirements,
  getGradeBandState,
  getGroupedAssessmentMetrics,
  getRemainingWeight,
  getSecuredContribution,
  getSemesterAverage,
  getSemesterGpa,
  getSortedGradeBands,
  gradeToGpa,
  hasRecordedCourseGrade,
  parsePercentInput,
} from "@/lib/grades/grade-utils";

describe("grade-utils", () => {
  it("parses percent inputs and editable percents", () => {
    expect(parsePercentInput("")).toBeNull();
    expect(parsePercentInput("8/10")).toBe(80);
    expect(parsePercentInput("7/0")).toBeNull();
    expect(parsePercentInput(" 82% ")).toBe(82);
    expect(parsePercentInput("82,5%")).toBe(82.5);
    expect(parsePercentInput("8,25/10")).toBe(82.5);
    expect(parsePercentInput("bad")).toBeNull();

    expect(formatEditablePercent(17, 20)).toBe("85");
    expect(formatEditablePercent(17, 0)).toBe("17");
    expect(formatPercent(82.26)).toBe("82.3%");
  });

  it("drops the lowest grouped item and derives weighted metrics", () => {
    const result = getGroupedAssessmentMetrics({
      id: "group-1",
      kind: ASSESSMENT_KIND_GROUP,
      category: GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
      dropLowest: 1,
      dueDate: "2026-05-01",
      items: [
        { id: "i1", label: "Tutorial 1", scoreAchieved: 8, totalPossible: 10 },
        { id: "i2", label: "Tutorial 2", scoreAchieved: 6, totalPossible: 10 },
        {
          id: "i3",
          label: "Tutorial 3",
          scoreAchieved: null,
          totalPossible: 10,
        },
      ],
      name: "Tutorials",
      status: ASSESSMENT_STATUS_ONGOING,
      weight: 30,
    });

    expect(result).toMatchObject({
      appliedDropCount: 1,
      currentPercent: 80,
      currentWeight: 15,
      gradedCount: 2,
      keptCount: 1,
      progressLabel: "2/3 graded",
      status: ASSESSMENT_STATUS_ONGOING,
      weightedContribution: 12,
    });
  });

  it("computes single-assessment percentages, weights, and status", () => {
    const completedSingle = {
      id: "single-1",
      kind: ASSESSMENT_KIND_SINGLE,
      category: SINGLE_ASSESSMENT_CATEGORY.QUIZ,
      dueDate: "2026-05-01",
      name: "Quiz 1",
      scoreAchieved: 18,
      status: ASSESSMENT_STATUS_COMPLETED,
      subminimumPercent: null,
      totalPossible: 20,
      weight: 25,
    } as const;

    const pendingSingle = {
      ...completedSingle,
      id: "single-2",
      scoreAchieved: null,
      status: ASSESSMENT_STATUS_ONGOING,
    } as const;

    expect(getAssessmentPercent(completedSingle)).toBe(90);
    expect(getAssessmentCurrentWeight(completedSingle)).toBe(25);
    expect(getAssessmentWeightedContribution(completedSingle)).toBe(22.5);
    expect(getAssessmentRemainingWeight(completedSingle)).toBe(0);
    expect(getAssessmentStatus(completedSingle)).toBe(
      ASSESSMENT_STATUS_COMPLETED,
    );

    expect(getAssessmentPercent(pendingSingle)).toBeNull();
    expect(getAssessmentCurrentWeight(pendingSingle)).toBe(0);
    expect(getAssessmentWeightedContribution(pendingSingle)).toBe(0);
    expect(getAssessmentRemainingWeight(pendingSingle)).toBe(25);
    expect(getAssessmentStatus(pendingSingle)).toBe(ASSESSMENT_STATUS_ONGOING);
  });

  it("derives grouped assessment helper values and completed status", () => {
    const grouped: GroupedAssessment = {
      id: "group-2",
      kind: ASSESSMENT_KIND_GROUP,
      category: GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
      dropLowest: 1,
      dueDate: "2026-05-01",
      items: [
        { id: "i1", label: "Tutorial 1", scoreAchieved: 9, totalPossible: 10 },
        { id: "i2", label: "Tutorial 2", scoreAchieved: 8, totalPossible: 10 },
        { id: "i3", label: "Tutorial 3", scoreAchieved: 7, totalPossible: 10 },
      ],
      name: "Tutorials",
      status: ASSESSMENT_STATUS_ONGOING,
      weight: 30,
    };

    expect(getAssessmentPercent(grouped)).toBe(85);
    expect(getAssessmentCurrentWeight(grouped)).toBe(30);
    expect(getAssessmentWeightedContribution(grouped)).toBe(25.5);
    expect(getAssessmentRemainingWeight(grouped)).toBe(0);
    expect(getAssessmentStatus(grouped)).toBe(ASSESSMENT_STATUS_COMPLETED);
  });

  it("builds subminimum requirements for pending and met assessments", () => {
    const course: Course = {
      id: "course-submins",
      accent: "teal",
      assessments: [
        {
          id: "pending",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.EXAM,
          dueDate: "2026-06-10",
          name: "Final exam",
          scoreAchieved: null,
          status: ASSESSMENT_STATUS_ONGOING,
          subminimumPercent: 50,
          totalPossible: 100,
          weight: 50,
        },
        {
          id: "met",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.ASSIGNMENT,
          dueDate: "2026-05-01",
          name: "Assignment",
          scoreAchieved: 60,
          status: ASSESSMENT_STATUS_COMPLETED,
          subminimumPercent: 50,
          totalPossible: 100,
          weight: 10,
        },
      ],
      code: "CHE101",
      credits: 12,
      gradeBands: [],
      instructor: "Dr. Kim",
      name: "Chemistry",
    };

    expect(getCourseSubminimumRequirements(course)).toEqual([
      {
        achievedPercent: null,
        assessmentId: "pending",
        assessmentName: "Final exam",
        minimumPercent: 50,
        status: "pending",
      },
      {
        achievedPercent: 60,
        assessmentId: "met",
        assessmentName: "Assignment",
        minimumPercent: 50,
        status: "met",
      },
    ]);
  });

  it("reports blocked targets when a subminimum has already failed", () => {
    const course: Course = {
      id: "course-1",
      accent: "teal",
      assessments: [
        {
          id: "a1",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.EXAM,
          dueDate: "2026-05-10",
          name: "Exam",
          scoreAchieved: 35,
          status: ASSESSMENT_STATUS_COMPLETED,
          subminimumPercent: 40,
          totalPossible: 100,
          weight: 50,
        },
        {
          id: "a2",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.ASSIGNMENT,
          dueDate: "2026-05-20",
          name: "Project",
          scoreAchieved: null,
          status: ASSESSMENT_STATUS_ONGOING,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 50,
        },
      ],
      code: "BIO101",
      credits: 12,
      gradeBands: [{ id: "band-a", label: "A", threshold: 80 }],
      instructor: "Dr. Rivera",
      name: "Biology",
    };

    const result = calculateRequiredScore(course, 80);

    expect(result.achievable).toBe(false);
    expect(result.hasFailedSubminimums).toBe(true);
    expect(result.remainingWeight).toBe(50);
    expect(result.message).toContain("blocked by subminimum rules");
    expect(result.message).toContain("Exam needs 40%");
  });

  it("handles completed-course and already-secured target branches", () => {
    const completedCourse: Course = {
      id: "course-closed",
      accent: "teal",
      assessments: [
        {
          id: "a1",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.ASSIGNMENT,
          dueDate: "2026-04-12",
          name: "Assignment 1",
          scoreAchieved: 80,
          status: ASSESSMENT_STATUS_COMPLETED,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 100,
        },
      ],
      code: "ENG101",
      credits: 12,
      gradeBands: [],
      instructor: "Dr. Shah",
      name: "English",
    };

    const aboveTarget = calculateRequiredScore(completedCourse, 70);
    const belowTarget = calculateRequiredScore(completedCourse, 90);

    expect(aboveTarget).toMatchObject({
      achievable: true,
      neededAverage: 0,
      remainingWeight: 0,
    });
    expect(aboveTarget.message).toContain("already closed above");

    expect(belowTarget).toMatchObject({
      achievable: false,
      neededAverage: 0,
      remainingWeight: 0,
    });
    expect(belowTarget.message).toContain("complete at 80%");

    const alreadySecuredCourse: Course = {
      ...completedCourse,
      id: "course-secured",
      assessments: [
        completedCourse.assessments[0]!,
        {
          id: "a2",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.PROJECT,
          dueDate: "2026-05-01",
          name: "Project",
          scoreAchieved: null,
          status: ASSESSMENT_STATUS_ONGOING,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 20,
        },
        {
          id: "a2",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.EXAM,
          dueDate: "2026-05-10",
          name: "Exam",
          scoreAchieved: null,
          status: ASSESSMENT_STATUS_ONGOING,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 30,
        },
      ],
    };

    const secured = calculateRequiredScore(alreadySecuredCourse, 60);
    expect(secured.achievable).toBe(true);
    expect(secured.neededAverage).toBe(0);
    expect(secured.message).toContain("already secured enough");
  });

  it("marks impossible targets that need more than 100 percent", () => {
    const course: Course = {
      id: "course-hard",
      accent: "teal",
      assessments: [
        {
          id: "a1",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.ASSIGNMENT,
          dueDate: "2026-04-12",
          name: "Assignment 1",
          scoreAchieved: 50,
          status: ASSESSMENT_STATUS_COMPLETED,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 20,
        },
        {
          id: "a2",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.EXAM,
          dueDate: "2026-05-10",
          name: "Exam",
          scoreAchieved: null,
          status: ASSESSMENT_STATUS_ONGOING,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 30,
        },
      ],
      code: "LAW101",
      credits: 16,
      gradeBands: [],
      instructor: "Dr. Ndlovu",
      name: "Law",
    };

    const result = calculateRequiredScore(course, 95);
    expect(result.achievable).toBe(false);
    expect(result.neededAverage).toBeGreaterThan(100);
    expect(result.message).toContain("not feasible");
  });

  it("distinguishes guaranteed, reachable, and unreachable grade bands", () => {
    const course: Course = {
      id: "course-2",
      accent: "teal",
      assessments: [
        {
          id: "a1",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.ASSIGNMENT,
          dueDate: "2026-04-12",
          name: "Assignment 1",
          scoreAchieved: 90,
          status: ASSESSMENT_STATUS_COMPLETED,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 40,
        },
        {
          id: "a2",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.PROJECT,
          dueDate: "2026-05-01",
          name: "Project",
          scoreAchieved: null,
          status: ASSESSMENT_STATUS_ONGOING,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 60,
        },
      ],
      code: "PHY101",
      credits: 16,
      gradeBands: [],
      instructor: "Dr. Lee",
      name: "Physics",
    };

    expect(getCourseCurrentGrade(course)).toBe(90);
    expect(getRemainingWeight(course)).toBe(60);
    expect(
      getGradeBandState(course, { id: "band-b", label: "B", threshold: 35 }),
    ).toBe(GRADE_BAND_STATE_GUARANTEED);
    expect(
      getGradeBandState(course, { id: "band-a", label: "A", threshold: 80 }),
    ).toBe(GRADE_BAND_STATE_REACHABLE);
    expect(
      getGradeBandState(course, {
        id: "band-impossible",
        label: "A+",
        threshold: 101,
      }),
    ).toBe(GRADE_BAND_STATE_UNREACHABLE);
  });

  it("derives course and semester rollups", () => {
    const courseA: Course = {
      id: "course-a",
      accent: "teal",
      assessments: [
        {
          id: "a1",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.ASSIGNMENT,
          dueDate: "2026-04-12",
          name: "Assignment 1",
          scoreAchieved: 90,
          status: ASSESSMENT_STATUS_COMPLETED,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 40,
        },
      ],
      code: "STA101",
      credits: 12,
      gradeBands: [
        { id: "c", label: "C", threshold: 60 },
        { id: "a", label: "A", threshold: 80 },
      ],
      instructor: "Dr. Khan",
      name: "Statistics",
    };
    const courseB: Course = {
      id: "course-b",
      accent: "teal",
      assessments: [
        {
          id: "b1",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.PROJECT,
          dueDate: "2026-04-20",
          name: "Project",
          scoreAchieved: 70,
          status: ASSESSMENT_STATUS_COMPLETED,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 100,
        },
      ],
      code: "HIS101",
      credits: 8,
      gradeBands: [],
      instructor: "Dr. Gomez",
      name: "History",
    };

    expect(getAssignedWeight(courseA)).toBe(40);
    expect(getSecuredContribution(courseA)).toBe(36);
    expect(hasRecordedCourseGrade(courseA)).toBe(true);
    expect(getCourseGuaranteedGrade(courseA)).toBe(36);
    expect(getSortedGradeBands(courseA).map((band) => band.label)).toEqual([
      "A",
      "C",
    ]);
    expect(getAssessmentPace(courseA)).toBe("1/1 done");

    expect(
      getSemesterAverage({
        id: "sem-1",
        name: "Semester 1",
        periodLabel: "January to June",
        courses: [courseA, courseB],
        modules: [courseA, courseB],
      }),
    ).toBe(82);
    expect(
      getSemesterGpa({
        id: "sem-1",
        name: "Semester 1",
        periodLabel: "January to June",
        courses: [courseA, courseB],
        modules: [courseA, courseB],
      }),
    ).toBe(3.6);
  });

  it("maps grades onto GPA bands", () => {
    expect(gradeToGpa(90)).toBe(4);
    expect(gradeToGpa(82)).toBe(3.7);
    expect(gradeToGpa(77)).toBe(3.3);
    expect(gradeToGpa(72)).toBe(3);
    expect(gradeToGpa(67)).toBe(2.7);
    expect(gradeToGpa(62)).toBe(2.3);
    expect(gradeToGpa(57)).toBe(2);
    expect(gradeToGpa(52)).toBe(1.7);
    expect(gradeToGpa(40)).toBe(0);
  });
});
