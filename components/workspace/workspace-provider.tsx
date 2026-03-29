"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { getDefaultAppState } from "@/lib/app-state";
import { createSemester } from "@/lib/semester-utils";
import { Assessment, Course, Semester } from "@/lib/types";

interface WorkspaceContextValue {
  semester: Semester;
  semesters: Semester[];
  selectedSemesterId: string;
  isExperimenting: boolean;
  startExperiment: () => void;
  stopExperiment: () => void;
  addSemester: (semester: Semester) => void;
  deleteSemester: (semesterId: string) => void;
  updateSemester: (
    semesterId: string,
    updates: Partial<Omit<Semester, "id" | "courses">>,
  ) => void;
  selectSemester: (semesterId: string) => void;
  addCourse: (course: Course) => void;
  updateCourse: (
    courseId: string,
    updates: Partial<Omit<Course, "id" | "assessments">>,
  ) => void;
  addAssessment: (courseId: string, assessment: Assessment) => void;
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

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const defaultState = getDefaultAppState();
  const [semesters, setSemesters] = useState<Semester[]>(
    defaultState.semesters,
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState(
    defaultState.selectedSemesterId,
  );
  const [isExperimenting, setIsExperimenting] = useState(false);
  const hasLoadedRef = useRef(false);
  const experimentSnapshotRef = useRef<{
    semesters: Semester[];
    selectedSemesterId: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      const response = await fetch("/api/state", { cache: "no-store" });
      const state = await response.json();

      if (cancelled) {
        return;
      }

      setSemesters(state.semesters);
      setSelectedSemesterId(state.selectedSemesterId);
      hasLoadedRef.current = true;
    }

    void loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      return;
    }

    if (isExperimenting) {
      return;
    }

    void fetch("/api/state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        semesters,
        selectedSemesterId,
      }),
    });
  }, [isExperimenting, selectedSemesterId, semesters]);

  useEffect(() => {
    if (isExperimenting && !pathname.startsWith("/workspace")) {
      const snapshot = experimentSnapshotRef.current;

      if (snapshot) {
        setSemesters(snapshot.semesters);
        setSelectedSemesterId(snapshot.selectedSemesterId);
      }

      experimentSnapshotRef.current = null;
      setIsExperimenting(false);
    }
  }, [isExperimenting, pathname]);

  const value = useMemo<WorkspaceContextValue>(() => {
    const semester =
      semesters.find((item) => item.id === selectedSemesterId) ??
      semesters[0] ??
      createSemester({
        name: "Semester 1",
        periodLabel: "Start by creating your first semester",
      });

    return {
      semester,
      semesters,
      selectedSemesterId: semester.id,
      isExperimenting,
      startExperiment: () => {
        if (isExperimenting) {
          return;
        }

        experimentSnapshotRef.current = {
          semesters: structuredClone(semesters),
          selectedSemesterId,
        };
        setIsExperimenting(true);
      },
      stopExperiment: () => {
        const snapshot = experimentSnapshotRef.current;

        if (snapshot) {
          setSemesters(snapshot.semesters);
          setSelectedSemesterId(snapshot.selectedSemesterId);
        }

        experimentSnapshotRef.current = null;
        setIsExperimenting(false);
      },
      addSemester: (nextSemester) => {
        setSemesters((current) => [...current, nextSemester]);
        setSelectedSemesterId(nextSemester.id);
      },
      deleteSemester: (semesterId) => {
        setSemesters((current) => {
          const remaining = current.filter((item) => item.id !== semesterId);

          if (selectedSemesterId === semesterId) {
            setSelectedSemesterId(remaining[0]?.id ?? "");
          }

          return remaining;
        });
      },
      updateSemester: (semesterId, updates) => {
        setSemesters((current) =>
          current.map((item) =>
            item.id === semesterId ? { ...item, ...updates } : item,
          ),
        );
      },
      selectSemester: (semesterId) => {
        setSelectedSemesterId(semesterId);
      },
      addCourse: (course) => {
        setSemesters((current) =>
          current.map((item) =>
            item.id === semester.id
              ? { ...item, courses: [...item.courses, course] }
              : item,
          ),
        );
      },
      updateCourse: (courseId, updates) => {
        setSemesters((current) =>
          current.map((item) =>
            item.id !== semester.id
              ? item
              : {
                  ...item,
                  courses: item.courses.map((course) =>
                    course.id === courseId ? { ...course, ...updates } : course,
                  ),
                },
          ),
        );
      },
      addAssessment: (courseId, assessment) => {
        setSemesters((current) =>
          current.map((item) =>
            item.id !== semester.id
              ? item
              : {
                  ...item,
                  courses: item.courses.map((course) =>
                    course.id === courseId
                      ? {
                          ...course,
                          assessments: [...course.assessments, assessment],
                        }
                      : course,
                  ),
                },
          ),
        );
      },
      updateAssessment: (courseId, nextAssessment) => {
        setSemesters((current) =>
          current.map((item) =>
            item.id !== semester.id
              ? item
              : {
                  ...item,
                  courses: item.courses.map((course) =>
                    course.id !== courseId
                      ? course
                      : {
                          ...course,
                          assessments: course.assessments.map((assessment) =>
                            assessment.id === nextAssessment.id
                              ? nextAssessment
                              : assessment,
                          ),
                        },
                  ),
                },
          ),
        );
      },
      reorderAssessments: (courseId, fromAssessmentId, toAssessmentId) => {
        setSemesters((current) =>
          current.map((item) => {
            if (item.id !== semester.id) {
              return item;
            }

            return {
              ...item,
              courses: item.courses.map((course) => {
                if (course.id !== courseId) {
                  return course;
                }

                const items = [...course.assessments];
                const fromIndex = items.findIndex(
                  (assessment) => assessment.id === fromAssessmentId,
                );
                const toIndex = items.findIndex(
                  (assessment) => assessment.id === toAssessmentId,
                );

                if (
                  fromIndex === -1 ||
                  toIndex === -1 ||
                  fromIndex === toIndex
                ) {
                  return course;
                }

                const [moved] = items.splice(fromIndex, 1);
                items.splice(toIndex, 0, moved);

                return {
                  ...course,
                  assessments: items,
                };
              }),
            };
          }),
        );
      },
      recordGrade: (courseId, assessmentId, scoreAchieved, totalPossible) => {
        setSemesters((current) =>
          current.map((item) =>
            item.id !== semester.id
              ? item
              : {
                  ...item,
                  courses: item.courses.map((course) =>
                    course.id !== courseId
                      ? course
                      : {
                          ...course,
                          assessments: course.assessments.map((assessment) =>
                            assessment.id !== assessmentId
                              ? assessment
                              : assessment.kind !== "single"
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
                },
          ),
        );
      },
    };
  }, [isExperimenting, selectedSemesterId, semesters]);

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
