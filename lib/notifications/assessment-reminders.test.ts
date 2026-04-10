import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/platform/platform", () => ({
  isNativeApp: vi.fn(),
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    cancel: vi.fn(),
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    schedule: vi.fn(),
  },
}));

import { LocalNotifications } from "@capacitor/local-notifications";

import type { AppState } from "@/lib/app/types";
import {
  getAssessmentReminderSnapshot,
  reconcileAssessmentReminderNotifications,
} from "@/lib/notifications/assessment-reminders";
import { isNativeApp } from "@/lib/platform/platform";

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  clear() {
    this.store.clear();
  }
}

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
                dueDate: "2026-04-30",
                status: "ongoing",
                reminder: { mode: "day_before" as const },
                scoreAchieved: null,
                subminimumPercent: null,
                totalPossible: 100,
                category: "assignment" as const,
              },
              {
                id: "assessment-2",
                kind: "single",
                name: "Project",
                weight: 30,
                dueDate: "2026-05-02",
                status: "ongoing",
                reminder: {
                  mode: "custom" as const,
                  customDateTime: "2026-05-01T14:30",
                },
                scoreAchieved: null,
                subminimumPercent: null,
                totalPossible: 100,
                category: "project" as const,
              },
              {
                id: "assessment-3",
                kind: "single",
                name: "Essay",
                weight: 10,
                dueDate: "",
                status: "ongoing",
                reminder: { mode: "morning_of" as const },
                scoreAchieved: null,
                subminimumPercent: null,
                totalPossible: 100,
                category: "assignment" as const,
              },
              {
                id: "group-1",
                kind: "group",
                name: "Tutorials",
                weight: 40,
                dueDate: "Category series",
                status: "ongoing",
                category: "tutorials" as const,
                dropLowest: 1,
                items: [],
              },
            ],
          },
        ],
        modules: [],
      },
    ],
  };
}

describe("assessment-reminders", () => {
  const storage = new MemoryStorage();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T09:00:00"));
    vi.clearAllMocks();
    storage.clear();
    vi.stubGlobal("window", { localStorage: storage });
    vi.mocked(isNativeApp).mockReturnValue(true);
    vi.mocked(LocalNotifications.cancel).mockResolvedValue();
    vi.mocked(LocalNotifications.schedule).mockResolvedValue({
      notifications: [],
    });
    vi.mocked(LocalNotifications.checkPermissions).mockResolvedValue({
      display: "granted",
    });
    vi.mocked(LocalNotifications.requestPermissions).mockResolvedValue({
      display: "granted",
    });
  });

  it("builds a snapshot for single assessments only", () => {
    const snapshot = JSON.parse(getAssessmentReminderSnapshot(createState()));

    expect(snapshot).toEqual([
      {
        assessmentId: "assessment-1",
        courseCode: "MAT101",
        dueDate: "2026-04-30",
        name: "Quiz 1",
        reminder: { mode: "day_before" },
      },
      {
        assessmentId: "assessment-2",
        courseCode: "MAT101",
        dueDate: "2026-05-02",
        name: "Project",
        reminder: {
          mode: "custom",
          customDateTime: "2026-05-01T14:30",
        },
      },
      {
        assessmentId: "assessment-3",
        courseCode: "MAT101",
        dueDate: "",
        name: "Essay",
        reminder: null,
      },
    ]);
  });

  it("does nothing outside the native app shell", async () => {
    vi.mocked(isNativeApp).mockReturnValue(false);

    await reconcileAssessmentReminderNotifications(createState());

    expect(LocalNotifications.cancel).not.toHaveBeenCalled();
    expect(LocalNotifications.schedule).not.toHaveBeenCalled();
  });

  it("cancels old managed notifications and schedules current ones", async () => {
    storage.setItem("gradelog-managed-reminder-ids-v1", JSON.stringify([777]));

    await reconcileAssessmentReminderNotifications(createState());

    expect(LocalNotifications.cancel).toHaveBeenCalledWith({
      notifications: expect.arrayContaining([{ id: 777 }]),
    });
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);

    const scheduled = vi.mocked(LocalNotifications.schedule).mock.calls[0]?.[0]
      .notifications;

    expect(scheduled).toHaveLength(2);
    expect(scheduled?.[0]).toMatchObject({
      title: "Upcoming assignment: Quiz 1",
      body: expect.stringContaining("MAT101 is due on"),
      schedule: {
        allowWhileIdle: true,
        at: new Date("2026-04-29T18:00:00"),
      },
    });
    expect(scheduled?.[1]).toMatchObject({
      title: "Upcoming assignment: Project",
      schedule: {
        allowWhileIdle: true,
        at: new Date("2026-05-01T14:30:00"),
      },
    });
  });

  it("stores managed ids and stops before scheduling when permission is denied", async () => {
    vi.mocked(LocalNotifications.checkPermissions).mockResolvedValue({
      display: "denied",
    });

    await reconcileAssessmentReminderNotifications(createState());

    expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    expect(
      JSON.parse(storage.getItem("gradelog-managed-reminder-ids-v1") ?? "[]"),
    ).toHaveLength(2);
  });

  it("requests permission when the platform returns prompt", async () => {
    vi.mocked(LocalNotifications.checkPermissions).mockResolvedValue({
      display: "prompt",
    });

    await reconcileAssessmentReminderNotifications(createState());

    expect(LocalNotifications.requestPermissions).toHaveBeenCalledTimes(1);
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
  });

  it("clears managed ids when no reminders remain", async () => {
    storage.setItem(
      "gradelog-managed-reminder-ids-v1",
      JSON.stringify([12, 13]),
    );
    const state = createState();
    state.semesters[0]!.courses[0]!.assessments = [
      {
        ...state.semesters[0]!.courses[0]!.assessments[0],
        dueDate: "",
        reminder: { mode: "off" },
      },
      {
        ...state.semesters[0]!.courses[0]!.assessments[1],
        reminder: { mode: "off" },
      },
    ];

    await reconcileAssessmentReminderNotifications(state);

    expect(LocalNotifications.cancel).toHaveBeenCalledWith({
      notifications: [{ id: 12 }, { id: 13 }],
    });
    expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    expect(storage.getItem("gradelog-managed-reminder-ids-v1")).toBe("[]");
  });

  it("handles invalid stored managed ids gracefully", async () => {
    storage.setItem("gradelog-managed-reminder-ids-v1", "{bad json");

    await reconcileAssessmentReminderNotifications(createState());

    expect(LocalNotifications.cancel).toHaveBeenCalled();
    expect(LocalNotifications.schedule).toHaveBeenCalled();
  });
});
