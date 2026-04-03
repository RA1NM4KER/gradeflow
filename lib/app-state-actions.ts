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

function mapCourseById(
  course: Course,
  courseId: string,
  update: (course: Course) => Course,
) {
  return course.id === courseId ? update(course) : course;
}

function updateCourseCollections(
  semester: Semester,
  courseId: string,
  update: (course: Course) => Course,
): Semester {
  const apply = (course: Course) => mapCourseById(course, courseId, update);

  return {
    ...semester,
    courses: semester.courses.map(apply),
    modules: semester.courses.map(apply),
  };
}

function updateCourseAssessments(
  semester: Semester,
  courseId: string,
  updateAssessments: (assessments: Assessment[]) => Assessment[],
): Semester {
  return updateCourseCollections(semester, courseId, (course) => ({
    ...course,
    assessments: updateAssessments(course.assessments),
  }));
}

function reorderAssessmentList(
  assessments: Assessment[],
  fromAssessmentId: string,
  toAssessmentId: string,
) {
  const nextAssessments = [...assessments];
  const fromIndex = nextAssessments.findIndex(
    (assessment) => assessment.id === fromAssessmentId,
  );
  const toIndex = nextAssessments.findIndex(
    (assessment) => assessment.id === toAssessmentId,
  );

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return assessments;
  }

  const [movedAssessment] = nextAssessments.splice(fromIndex, 1);
  nextAssessments.splice(toIndex, 0, movedAssessment);

  return nextAssessments;
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
  return updateSemesterById(state, semesterId, (semester) => {
    const nextCourses = [...semester.courses, course];

    return {
      ...semester,
      courses: nextCourses,
      modules: nextCourses,
    };
  });
}

export function updateCourse(
  state: AppState,
  semesterId: string,
  courseId: string,
  updates: Partial<Omit<Course, "id" | "assessments">>,
): AppState {
  return updateSemesterById(state, semesterId, (semester) =>
    updateCourseCollections(semester, courseId, (course) => ({
      ...course,
      ...updates,
    })),
  );
}

export function deleteCourse(
  state: AppState,
  semesterId: string,
  courseId: string,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => {
    const nextCourses = semester.courses.filter(
      (course) => course.id !== courseId,
    );

    return {
      ...semester,
      courses: nextCourses,
      modules: nextCourses,
    };
  });
}

export function addAssessment(
  state: AppState,
  semesterId: string,
  courseId: string,
  assessment: Assessment,
): AppState {
  return updateSemesterById(state, semesterId, (semester) =>
    updateCourseAssessments(semester, courseId, (assessments) => [
      ...assessments,
      assessment,
    ]),
  );
}

export function updateAssessment(
  state: AppState,
  semesterId: string,
  courseId: string,
  nextAssessment: Assessment,
): AppState {
  return updateSemesterById(state, semesterId, (semester) =>
    updateCourseAssessments(semester, courseId, (assessments) =>
      assessments.map((assessment) =>
        assessment.id === nextAssessment.id ? nextAssessment : assessment,
      ),
    ),
  );
}

export function reorderAssessments(
  state: AppState,
  semesterId: string,
  courseId: string,
  fromAssessmentId: string,
  toAssessmentId: string,
): AppState {
  return updateSemesterById(state, semesterId, (semester) =>
    updateCourseAssessments(semester, courseId, (assessments) =>
      reorderAssessmentList(assessments, fromAssessmentId, toAssessmentId),
    ),
  );
}

export function deleteAssessment(
  state: AppState,
  semesterId: string,
  courseId: string,
  assessmentId: string,
): AppState {
  return updateSemesterById(state, semesterId, (semester) =>
    updateCourseAssessments(semester, courseId, (assessments) =>
      assessments.filter((assessment) => assessment.id !== assessmentId),
    ),
  );
}

export function recordGrade(
  state: AppState,
  semesterId: string,
  courseId: string,
  assessmentId: string,
  scoreAchieved: number,
  totalPossible: number,
): AppState {
  return updateSemesterById(state, semesterId, (semester) =>
    updateCourseAssessments(semester, courseId, (assessments) =>
      assessments.map((assessment) =>
        assessment.id !== assessmentId || assessment.kind !== "single"
          ? assessment
          : {
              ...assessment,
              scoreAchieved,
              totalPossible,
              status: "completed",
            },
      ),
    ),
  );
}
