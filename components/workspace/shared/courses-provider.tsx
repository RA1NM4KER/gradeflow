"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CoursesBootState } from "@/components/workspace/shared/courses-boot-state";
import { useSyncConnection } from "@/components/sync/sync-provider";
import { AppState } from "@/lib/app/types";
import * as appStateActions from "@/lib/app/app-state-actions";
import { createSemester } from "@/lib/course/semester-utils";
import {
  buildAssessmentCreateOperation,
  buildAssessmentDeleteOperation,
  buildAssessmentReorderOperation,
  buildAssessmentUpdateOperation,
  buildCourseCreateOperation,
  buildCourseDeleteOperation,
  buildCourseUpdateOperation,
  buildRecordGradeOperation,
  buildSemesterCreateOperation,
  buildSemesterDeleteOperation,
  buildSemesterUpdateOperation,
} from "@/lib/sync/sync-operation-builders";
import { loadSyncMeta } from "@/lib/sync/sync-storage";
import { SyncMetaRecord, SyncOperation } from "@/lib/sync/types";
import { usePersistedAppState } from "@/lib/app/use-persisted-app-state";
import { Assessment, Course, Semester } from "@/lib/shared/types";

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
  addCourseToSemester: (semesterId: string, course: Course) => void;
  deleteCourse: (courseId: string) => void;
  moveCourse: (courseId: string, toSemesterId: string) => void;
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
type BuiltSyncOperation = {
  nextMeta: SyncMetaRecord;
  operation: SyncOperation;
} | null;

export function CoursesProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    appState: persistedAppState,
    bootError,
    isHydrated,
    replaceAppState: replacePersistedAppState,
  } = usePersistedAppState();
  const { enqueueOperation, registerSyncAdapter } = useSyncConnection();
  const [experimentAppState, setExperimentAppState] = useState<AppState | null>(
    null,
  );
  const persistedAppStateRef = useRef<AppState | null>(persistedAppState);

  const isExperimenting = experimentAppState !== null;
  const activeAppState = experimentAppState ?? persistedAppState;

  useEffect(() => {
    persistedAppStateRef.current = persistedAppState;
  }, [persistedAppState]);

  const syncAdapter = useMemo(
    () => ({
      applyRemoteState: (state: AppState) => {
        setExperimentAppState(null);
        replacePersistedAppState(state);
      },
      getAppState: () => persistedAppStateRef.current,
    }),
    [replacePersistedAppState],
  );

  useEffect(() => {
    if (
      experimentAppState &&
      !pathname.startsWith("/courses") &&
      !pathname.startsWith("/workspace")
    ) {
      setExperimentAppState(null);
    }
  }, [experimentAppState, pathname]);

  useEffect(() => {
    registerSyncAdapter(syncAdapter);

    return () => {
      registerSyncAdapter(null);
    };
  }, [registerSyncAdapter, syncAdapter]);

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

  const applyPersistedDataChange = useCallback(
    async (
      updateState: (currentState: AppState) => AppState,
      buildOperation: (currentState: AppState) => Promise<BuiltSyncOperation>,
    ) => {
      if (!persistedAppState) {
        return;
      }

      const currentState = persistedAppState;
      const nextState = updateState(currentState);
      replacePersistedAppState(nextState);
      const builtOperation = await buildOperation(currentState);

      if (builtOperation) {
        void enqueueOperation(
          currentState,
          builtOperation.operation,
          builtOperation.nextMeta,
        );
      }
    },
    [enqueueOperation, persistedAppState, replacePersistedAppState],
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
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.addSemester(currentState, nextSemester),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.addSemester(currentState, nextSemester),
          async () => {
            const syncMeta = await loadSyncMeta();
            return buildSemesterCreateOperation(syncMeta, nextSemester);
          },
        );
      },
      deleteSemester: (semesterId) => {
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.deleteSemester(currentState, semesterId),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.deleteSemester(currentState, semesterId),
          async () => {
            const syncMeta = await loadSyncMeta();
            return buildSemesterDeleteOperation(syncMeta, semesterId);
          },
        );
      },
      updateSemester: (semesterId, updates) => {
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.updateSemester(currentState, semesterId, updates),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.updateSemester(currentState, semesterId, updates),
          async () => {
            const syncMeta = await loadSyncMeta();
            const built = buildSemesterUpdateOperation(
              syncMeta,
              semesterId,
              updates,
            );
            return built.operation.fieldMask.length > 0 ? built : null;
          },
        );
      },
      selectSemester: (semesterId) => {
        applyWorkspaceState((currentState) =>
          appStateActions.selectSemester(currentState, semesterId),
        );
      },
      addCourse: (course) => {
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.addCourse(currentState, semester.id, course),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.addCourse(currentState, semester.id, course),
          async () => {
            const syncMeta = await loadSyncMeta();
            return buildCourseCreateOperation(syncMeta, semester.id, course);
          },
        );
      },
      addCourseToSemester: (semesterId, course) => {
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.addCourse(currentState, semesterId, course),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.addCourse(
              {
                ...currentState,
                selectedSemesterId: semesterId,
              },
              semesterId,
              course,
            ),
          async () => {
            const syncMeta = await loadSyncMeta();
            return buildCourseCreateOperation(syncMeta, semesterId, course);
          },
        );
      },
      deleteCourse: (courseId) => {
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.deleteCourse(currentState, semester.id, courseId),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.deleteCourse(currentState, semester.id, courseId),
          async () => {
            const syncMeta = await loadSyncMeta();
            return buildCourseDeleteOperation(syncMeta, semester.id, courseId);
          },
        );
      },
      moveCourse: (courseId, toSemesterId) => {
        if (semester.id === toSemesterId) {
          return;
        }

        const course =
          semester.courses.find((item) => item.id === courseId) ?? null;

        if (!course) {
          return;
        }

        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.moveCourse(
              currentState,
              semester.id,
              toSemesterId,
              courseId,
            ),
          );
          return;
        }

        if (!persistedAppState) {
          return;
        }

        const currentState = persistedAppState;
        const intermediateState = appStateActions.deleteCourse(
          currentState,
          semester.id,
          courseId,
        );
        const finalState = appStateActions.addCourse(
          {
            ...intermediateState,
            selectedSemesterId: toSemesterId,
          },
          toSemesterId,
          course,
        );

        replacePersistedAppState(finalState);

        void (async () => {
          const syncMeta = await loadSyncMeta();
          const deleteBuilt = buildCourseDeleteOperation(
            syncMeta,
            semester.id,
            courseId,
          );

          await enqueueOperation(
            currentState,
            deleteBuilt.operation,
            deleteBuilt.nextMeta,
          );

          const createBuilt = buildCourseCreateOperation(
            deleteBuilt.nextMeta,
            toSemesterId,
            course,
          );

          await enqueueOperation(
            intermediateState,
            createBuilt.operation,
            createBuilt.nextMeta,
          );
        })().catch((error) => {
          console.error("Failed to enqueue synced course move.", error);
        });
      },
      updateCourse: (courseId, updates) => {
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.updateCourse(
              currentState,
              semester.id,
              courseId,
              updates,
            ),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.updateCourse(
              currentState,
              semester.id,
              courseId,
              updates,
            ),
          async () => {
            const syncMeta = await loadSyncMeta();
            const built = buildCourseUpdateOperation(
              syncMeta,
              semester.id,
              courseId,
              updates,
            );
            return built.operation.fieldMask.length > 0 ? built : null;
          },
        );
      },
      addAssessment: (courseId, assessment) => {
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.addAssessment(
              currentState,
              semester.id,
              courseId,
              assessment,
            ),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.addAssessment(
              currentState,
              semester.id,
              courseId,
              assessment,
            ),
          async () => {
            const syncMeta = await loadSyncMeta();
            return buildAssessmentCreateOperation(
              syncMeta,
              semester.id,
              courseId,
              assessment,
            );
          },
        );
      },
      deleteAssessment: (courseId, assessmentId) => {
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.deleteAssessment(
              currentState,
              semester.id,
              courseId,
              assessmentId,
            ),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.deleteAssessment(
              currentState,
              semester.id,
              courseId,
              assessmentId,
            ),
          async () => {
            const syncMeta = await loadSyncMeta();
            return buildAssessmentDeleteOperation(
              syncMeta,
              semester.id,
              courseId,
              assessmentId,
            );
          },
        );
      },
      updateAssessment: (courseId, nextAssessment) => {
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.updateAssessment(
              currentState,
              semester.id,
              courseId,
              nextAssessment,
            ),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.updateAssessment(
              currentState,
              semester.id,
              courseId,
              nextAssessment,
            ),
          async (currentState) => {
            const currentAssessment =
              currentState.semesters
                .find((item) => item.id === semester.id)
                ?.courses.find((course) => course.id === courseId)
                ?.assessments.find(
                  (assessment) => assessment.id === nextAssessment.id,
                ) ?? null;

            if (!currentAssessment) {
              return null;
            }

            const syncMeta = await loadSyncMeta();
            const built = buildAssessmentUpdateOperation(
              syncMeta,
              semester.id,
              courseId,
              currentAssessment,
              nextAssessment,
            );

            return built.operation.fieldMask.length > 0 ? built : null;
          },
        );
      },
      reorderAssessments: (courseId, fromAssessmentId, toAssessmentId) => {
        if (isExperimenting) {
          applyWorkspaceState((currentState) =>
            appStateActions.reorderAssessments(
              currentState,
              semester.id,
              courseId,
              fromAssessmentId,
              toAssessmentId,
            ),
          );
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.reorderAssessments(
              currentState,
              semester.id,
              courseId,
              fromAssessmentId,
              toAssessmentId,
            ),
          async () => {
            const syncMeta = await loadSyncMeta();
            return buildAssessmentReorderOperation(
              syncMeta,
              semester.id,
              courseId,
              fromAssessmentId,
              toAssessmentId,
            );
          },
        );
      },
      recordGrade: (courseId, assessmentId, scoreAchieved, totalPossible) => {
        if (isExperimenting) {
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
          return;
        }

        void applyPersistedDataChange(
          (currentState) =>
            appStateActions.recordGrade(
              currentState,
              semester.id,
              courseId,
              assessmentId,
              scoreAchieved,
              totalPossible,
            ),
          async () => {
            const syncMeta = await loadSyncMeta();
            return buildRecordGradeOperation(
              syncMeta,
              semester.id,
              courseId,
              assessmentId,
              scoreAchieved,
              totalPossible,
            );
          },
        ).catch((error) => {
          console.error("Failed to enqueue synced grade update.", error);
        });
      },
    };
  }, [
    activeAppState,
    applyPersistedDataChange,
    applyWorkspaceState,
    enqueueOperation,
    isExperimenting,
    persistedAppState,
    replacePersistedAppState,
  ]);

  if (!isHydrated || !value) {
    return bootError ? (
      <CoursesBootState
        action={
          <Button
            onClick={() => window.location.reload()}
            size="pill"
            type="button"
          >
            Reload app
          </Button>
        }
        description={bootError}
        title="Local storage unavailable"
      />
    ) : (
      <CoursesBootState
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
