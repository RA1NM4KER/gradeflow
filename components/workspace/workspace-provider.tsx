"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { WorkspaceBootState } from "@/components/workspace/workspace-boot-state";
import { AppState } from "@/lib/app-state";
import * as appStateActions from "@/lib/app-state-actions";
import { createSemester } from "@/lib/semester-utils";
import { usePersistedAppState } from "@/lib/use-persisted-app-state";
import { Assessment, Course, Semester } from "@/lib/types";

interface CoursesContextValue {
  appState: AppState;
  semester: Semester;
  semesters: Semester[];
  selectedSemesterId: string;
  isExperimenting: boolean;
  replaceAppState: (state: AppState) => void;
  startExperiment: () => void;
  stopExperiment: () => void;
  addSemester: (semester: Semester) => void;
  deleteSemester: (semesterId: string) => void;
  updateSemester: (
    semesterId: string,
    updates: Partial<Omit<Semester, "id" | "courses" | "modules">>,
  ) => void;
  selectSemester: (semesterId: string) => void;
  addCourse: (course: Course) => void;
  updateCourse: (
    courseId: string,
    updates: Partial<Omit<Course, "id" | "assessments">>,
  ) => void;
  addAssessment: (courseId: string, assessment: Assessment) => void;
  deleteAssessment: (courseId: string, assessmentId: string) => void;
  updateAssessment: (courseId: string, assessment: Assessment) => void;
  reorderAssessments: (
    courseId: string,
    fromAssessmentId: string,
    toAssessmentId: string,
  ) => void;
  recordGrade: (
    courseId: string,
    assessmentId: string,
    scoreAchieved: number,
    totalPossible: number,
  ) => void;
}

const CoursesContext = createContext<CoursesContextValue | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    appState: persistedAppState,
    bootError,
    isHydrated,
    replaceAppState: replacePersistedAppState,
  } = usePersistedAppState();
  const [experimentAppState, setExperimentAppState] = useState<AppState | null>(
    null,
  );

  const isExperimenting = experimentAppState !== null;
  const activeAppState = experimentAppState ?? persistedAppState;

  useEffect(() => {
    if (
      experimentAppState &&
      !pathname.startsWith("/courses") &&
      !pathname.startsWith("/workspace")
    ) {
      setExperimentAppState(null);
    }
  }, [experimentAppState, pathname]);

  const applyWorkspaceState = useCallback(
    (updater: AppState | ((current: AppState) => AppState)) => {
      if (!persistedAppState) {
        return;
      }

      if (experimentAppState) {
        setExperimentAppState((currentState) => {
          const experimentBaseState = currentState ?? persistedAppState;
          return typeof updater === "function"
            ? updater(experimentBaseState)
            : updater;
        });
        return;
      }

      replacePersistedAppState(updater);
    },
    [experimentAppState, persistedAppState, replacePersistedAppState],
  );

  const value = useMemo<CoursesContextValue | null>(() => {
    if (!activeAppState) {
      return null;
    }

    const semester =
      activeAppState.semesters.find(
        (item) => item.id === activeAppState.selectedSemesterId,
      ) ??
      activeAppState.semesters[0] ??
      createSemester({
        name: "Semester 1",
        periodLabel: "Start by creating your first semester",
      });

    return {
      appState: activeAppState,
      semester,
      semesters: activeAppState.semesters,
      selectedSemesterId: semester.id,
      isExperimenting,
      replaceAppState: (nextState) => {
        setExperimentAppState(null);
        replacePersistedAppState(nextState);
      },
      startExperiment: () => {
        if (isExperimenting || !persistedAppState) {
          return;
        }

        setExperimentAppState(structuredClone(persistedAppState));
      },
      stopExperiment: () => {
        setExperimentAppState(null);
      },
      addSemester: (nextSemester) => {
        applyWorkspaceState((currentState) =>
          appStateActions.addSemester(currentState, nextSemester),
        );
      },
      deleteSemester: (semesterId) => {
        applyWorkspaceState((currentState) =>
          appStateActions.deleteSemester(currentState, semesterId),
        );
      },
      updateSemester: (semesterId, updates) => {
        applyWorkspaceState((currentState) =>
          appStateActions.updateSemester(currentState, semesterId, updates),
        );
      },
      selectSemester: (semesterId) => {
        applyWorkspaceState((currentState) =>
          appStateActions.selectSemester(currentState, semesterId),
        );
      },
      addCourse: (course) => {
        applyWorkspaceState((currentState) =>
          appStateActions.addCourse(currentState, semester.id, course),
        );
      },
      updateCourse: (courseId, updates) => {
        applyWorkspaceState((currentState) =>
          appStateActions.updateCourse(
            currentState,
            semester.id,
            courseId,
            updates,
          ),
        );
      },
      addAssessment: (courseId, assessment) => {
        applyWorkspaceState((currentState) =>
          appStateActions.addAssessment(
            currentState,
            semester.id,
            courseId,
            assessment,
          ),
        );
      },
      deleteAssessment: (courseId, assessmentId) => {
        applyWorkspaceState((currentState) =>
          appStateActions.deleteAssessment(
            currentState,
            semester.id,
            courseId,
            assessmentId,
          ),
        );
      },
      updateAssessment: (courseId, nextAssessment) => {
        applyWorkspaceState((currentState) =>
          appStateActions.updateAssessment(
            currentState,
            semester.id,
            courseId,
            nextAssessment,
          ),
        );
      },
      reorderAssessments: (courseId, fromAssessmentId, toAssessmentId) => {
        applyWorkspaceState((currentState) =>
          appStateActions.reorderAssessments(
            currentState,
            semester.id,
            courseId,
            fromAssessmentId,
            toAssessmentId,
          ),
        );
      },
      recordGrade: (courseId, assessmentId, scoreAchieved, totalPossible) => {
        applyWorkspaceState((currentState) =>
          appStateActions.recordGrade(
            currentState,
            semester.id,
            courseId,
            assessmentId,
            scoreAchieved,
            totalPossible,
          ),
        );
      },
    };
  }, [
    activeAppState,
    applyWorkspaceState,
    isExperimenting,
    persistedAppState,
    replacePersistedAppState,
  ]);

  if (!isHydrated || !value) {
    return bootError ? (
      <WorkspaceBootState
        action={
          <button
            className="inline-flex h-11 items-center rounded-full bg-stone-950 px-5 text-sm font-semibold text-stone-50"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload app
          </button>
        }
        description={bootError}
        title="Local storage unavailable"
      />
    ) : (
      <WorkspaceBootState
        description="Restoring your saved semesters, courses, and assessments."
        title="Opening courses"
      />
    );
  }

  return (
    <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);

  if (!context) {
    throw new Error("useCourses must be used within a CoursesProvider");
  }

  return context;
}

export const WorkspaceProvider = CoursesProvider;
export const useWorkspace = useCourses;
