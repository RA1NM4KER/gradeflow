import { AppState } from "@/lib/app-state";
import { Assessment, Module, Semester } from "@/lib/types";

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
  updates: Partial<Omit<Semester, "id" | "modules">>,
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

export function addModule(
  state: AppState,
  semesterId: string,
  module: Module,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    modules: [...semester.modules, module],
  }));
}

export function updateModule(
  state: AppState,
  semesterId: string,
  moduleId: string,
  updates: Partial<Omit<Module, "id" | "assessments">>,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    modules: semester.modules.map((module) =>
      module.id === moduleId ? { ...module, ...updates } : module,
    ),
  }));
}

export function addAssessment(
  state: AppState,
  semesterId: string,
  moduleId: string,
  assessment: Assessment,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    modules: semester.modules.map((module) =>
      module.id === moduleId
        ? { ...module, assessments: [...module.assessments, assessment] }
        : module,
    ),
  }));
}

export function updateAssessment(
  state: AppState,
  semesterId: string,
  moduleId: string,
  nextAssessment: Assessment,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    modules: semester.modules.map((module) =>
      module.id !== moduleId
        ? module
        : {
            ...module,
            assessments: module.assessments.map((assessment) =>
              assessment.id === nextAssessment.id ? nextAssessment : assessment,
            ),
          },
    ),
  }));
}

export function reorderAssessments(
  state: AppState,
  semesterId: string,
  moduleId: string,
  fromAssessmentId: string,
  toAssessmentId: string,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    modules: semester.modules.map((module) => {
      if (module.id !== moduleId) {
        return module;
      }

      const assessments = [...module.assessments];
      const fromIndex = assessments.findIndex(
        (assessment) => assessment.id === fromAssessmentId,
      );
      const toIndex = assessments.findIndex(
        (assessment) => assessment.id === toAssessmentId,
      );

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return module;
      }

      const [movedAssessment] = assessments.splice(fromIndex, 1);
      assessments.splice(toIndex, 0, movedAssessment);

      return {
        ...module,
        assessments,
      };
    }),
  }));
}

export function recordGrade(
  state: AppState,
  semesterId: string,
  moduleId: string,
  assessmentId: string,
  scoreAchieved: number,
  totalPossible: number,
): AppState {
  return updateSemesterById(state, semesterId, (semester) => ({
    ...semester,
    modules: semester.modules.map((module) =>
      module.id !== moduleId
        ? module
        : {
            ...module,
            assessments: module.assessments.map((assessment) =>
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
