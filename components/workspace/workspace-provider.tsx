"use client";

import {
  createContext,
  ReactNode,
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
import { Assessment, Module, Semester } from "@/lib/types";

interface WorkspaceContextValue {
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
    updates: Partial<Omit<Semester, "id" | "modules">>,
  ) => void;
  selectSemester: (semesterId: string) => void;
  addModule: (module: Module) => void;
  updateModule: (
    moduleId: string,
    updates: Partial<Omit<Module, "id" | "assessments">>,
  ) => void;
  addAssessment: (moduleId: string, assessment: Assessment) => void;
  updateAssessment: (moduleId: string, assessment: Assessment) => void;
  reorderAssessments: (
    moduleId: string,
    fromAssessmentId: string,
    toAssessmentId: string,
  ) => void;
  recordGrade: (
    moduleId: string,
    assessmentId: string,
    scoreAchieved: number,
    totalPossible: number,
  ) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
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
    if (experimentAppState && !pathname.startsWith("/workspace")) {
      setExperimentAppState(null);
    }
  }, [experimentAppState, pathname]);

  const updateActiveAppState = useMemo(
    () =>
      function updateActiveAppState(
        updater: AppState | ((current: AppState) => AppState),
      ) {
        if (!persistedAppState) {
          return;
        }

        if (experimentAppState) {
          setExperimentAppState((currentState) => {
            const baseState = currentState ?? persistedAppState;
            return typeof updater === "function" ? updater(baseState) : updater;
          });
          return;
        }

        replacePersistedAppState(updater);
      },
    [experimentAppState, persistedAppState, replacePersistedAppState],
  );

  const value = useMemo<WorkspaceContextValue | null>(() => {
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
        updateActiveAppState((currentState) =>
          appStateActions.addSemester(currentState, nextSemester),
        );
      },
      deleteSemester: (semesterId) => {
        updateActiveAppState((currentState) =>
          appStateActions.deleteSemester(currentState, semesterId),
        );
      },
      updateSemester: (semesterId, updates) => {
        updateActiveAppState((currentState) =>
          appStateActions.updateSemester(currentState, semesterId, updates),
        );
      },
      selectSemester: (semesterId) => {
        updateActiveAppState((currentState) =>
          appStateActions.selectSemester(currentState, semesterId),
        );
      },
      addModule: (module) => {
        updateActiveAppState((currentState) =>
          appStateActions.addModule(currentState, semester.id, module),
        );
      },
      updateModule: (moduleId, updates) => {
        updateActiveAppState((currentState) =>
          appStateActions.updateModule(
            currentState,
            semester.id,
            moduleId,
            updates,
          ),
        );
      },
      addAssessment: (moduleId, assessment) => {
        updateActiveAppState((currentState) =>
          appStateActions.addAssessment(
            currentState,
            semester.id,
            moduleId,
            assessment,
          ),
        );
      },
      updateAssessment: (moduleId, nextAssessment) => {
        updateActiveAppState((currentState) =>
          appStateActions.updateAssessment(
            currentState,
            semester.id,
            moduleId,
            nextAssessment,
          ),
        );
      },
      reorderAssessments: (moduleId, fromAssessmentId, toAssessmentId) => {
        updateActiveAppState((currentState) =>
          appStateActions.reorderAssessments(
            currentState,
            semester.id,
            moduleId,
            fromAssessmentId,
            toAssessmentId,
          ),
        );
      },
      recordGrade: (moduleId, assessmentId, scoreAchieved, totalPossible) => {
        updateActiveAppState((currentState) =>
          appStateActions.recordGrade(
            currentState,
            semester.id,
            moduleId,
            assessmentId,
            scoreAchieved,
            totalPossible,
          ),
        );
      },
    };
  }, [
    activeAppState,
    isExperimenting,
    persistedAppState,
    replacePersistedAppState,
    updateActiveAppState,
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
        description="Opening your local workspace and restoring your saved semesters."
        title="Loading Gradeflow"
      />
    );
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }

  return context;
}
