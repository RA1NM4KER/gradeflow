import { AppState } from "@/lib/app-state";
import { Assessment, Course, Semester } from "@/lib/types";

function updateSemesterById(
  state: AppState,
  semesterId: string,
  update: (semester: Semester) => Semester,
): AppState {
  return {
    ...state,
    semesters: state.semesters.map((semester) =>
      semester.id === semesterId ? update(semester) : semester,
    ),
  };
}

export function addSemester(state: AppState, semester: Semester): AppState {
  return {
    semesters: [...state.semesters, semester],
    selectedSemesterId: semester.id,
  };
}

export function deleteSemester(state: AppState, semesterId: string): AppState {
  const remainingSemesters = state.semesters.filter(
    (semester) => semester.id !== semesterId,
  );

  return {
    semesters: remainingSemesters,
    selectedSemesterId:
      state.selectedSemesterId === semesterId
        ? (remainingSemesters[0]?.id ?? "")
        : state.selectedSemesterId,
  };
}

export function updateSemester(
  state: AppState,
  semesterId: string,
  updates: Partial<Omit<Semester, "id" | "courses" | "modules">>,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    ...updates,
  }));
}

export function selectSemester(state: AppState, semesterId: string): AppState {
  return {
    ...state,
    selectedSemesterId: semesterId,
  };
}

export function addCourse(
  state: AppState,
  semesterId: string,
  course: Course,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    courses: [...semester.courses, course],
    modules: [...semester.courses, course],
  }));
}

export function updateCourse(
  state: AppState,
  semesterId: string,
  courseId: string,
  updates: Partial<Omit<Course, "id" | "assessments">>,
): AppState {
  const courses = state.semesters.find(
    (semester) => semester.id === semesterId,
  )?.courses;

  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    courses: semester.courses.map((course) =>
      course.id === courseId ? { ...course, ...updates } : course,
    ),
    modules: semester.courses.map((course) =>
      course.id === courseId ? { ...course, ...updates } : course,
    ),
  }));
}

export function addAssessment(
  state: AppState,
  semesterId: string,
  courseId: string,
  assessment: Assessment,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    courses: semester.courses.map((course) =>
      course.id === courseId
        ? { ...course, assessments: [...course.assessments, assessment] }
        : course,
    ),
    modules: semester.courses.map((course) =>
      course.id === courseId
        ? { ...course, assessments: [...course.assessments, assessment] }
        : course,
    ),
  }));
}

export function updateAssessment(
  state: AppState,
  semesterId: string,
  courseId: string,
  nextAssessment: Assessment,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    courses: semester.courses.map((course) =>
      course.id !== courseId
        ? course
        : {
            ...course,
            assessments: course.assessments.map((assessment) =>
              assessment.id === nextAssessment.id ? nextAssessment : assessment,
            ),
          },
    ),
    modules: semester.courses.map((course) =>
      course.id !== courseId
        ? course
        : {
            ...course,
            assessments: course.assessments.map((assessment) =>
              assessment.id === nextAssessment.id ? nextAssessment : assessment,
            ),
          },
    ),
  }));
}

export function reorderAssessments(
  state: AppState,
  semesterId: string,
  courseId: string,
  fromAssessmentId: string,
  toAssessmentId: string,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    courses: semester.courses.map((course) => {
      if (course.id !== courseId) {
        return course;
      }

      const assessments = [...course.assessments];
      const fromIndex = assessments.findIndex(
        (assessment) => assessment.id === fromAssessmentId,
      );
      const toIndex = assessments.findIndex(
        (assessment) => assessment.id === toAssessmentId,
      );

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return course;
      }

      const [movedAssessment] = assessments.splice(fromIndex, 1);
      assessments.splice(toIndex, 0, movedAssessment);

      return {
        ...course,
        assessments,
      };
    }),
    modules: semester.courses.map((course) => {
      if (course.id !== courseId) {
        return course;
      }

      const assessments = [...course.assessments];
      const fromIndex = assessments.findIndex(
        (assessment) => assessment.id === fromAssessmentId,
      );
      const toIndex = assessments.findIndex(
        (assessment) => assessment.id === toAssessmentId,
      );

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return course;
      }

      const [movedAssessment] = assessments.splice(fromIndex, 1);
      assessments.splice(toIndex, 0, movedAssessment);

      return {
        ...course,
        assessments,
      };
    }),
  }));
}

export function deleteAssessment(
  state: AppState,
  semesterId: string,
  courseId: string,
  assessmentId: string,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    courses: semester.courses.map((course) =>
      course.id !== courseId
        ? course
        : {
            ...course,
            assessments: course.assessments.filter(
              (assessment) => assessment.id !== assessmentId,
            ),
          },
    ),
    modules: semester.courses.map((course) =>
      course.id !== courseId
        ? course
        : {
            ...course,
            assessments: course.assessments.filter(
              (assessment) => assessment.id !== assessmentId,
            ),
          },
    ),
  }));
}

export function recordGrade(
  state: AppState,
  semesterId: string,
  courseId: string,
  assessmentId: string,
  scoreAchieved: number,
  totalPossible: number,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    courses: semester.courses.map((course) =>
      course.id !== courseId
        ? course
        : {
            ...course,
            assessments: course.assessments.map((assessment) =>
              assessment.id !== assessmentId || assessment.kind !== "single"
                ? assessment
                : {
                    ...assessment,
                    scoreAchieved,
                    totalPossible,
                    status: "completed",
                  },
            ),
          },
    ),
    modules: semester.courses.map((course) =>
      course.id !== courseId
        ? course
        : {
            ...course,
            assessments: course.assessments.map((assessment) =>
              assessment.id !== assessmentId || assessment.kind !== "single"
                ? assessment
                : {
                    ...assessment,
                    scoreAchieved,
                    totalPossible,
                    status: "completed",
                  },
            ),
          },
    ),
  }));
}

export const addModule = addCourse;
export const updateModule = updateCourse;
