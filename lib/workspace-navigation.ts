"use client";

const WORKSPACE_NAVIGATION_EVENT = "gradeflow:workspace-navigation";

function warmCoursesRoute(url: string) {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    process.env.NODE_ENV !== "production" ||
    !navigator.onLine
  ) {
    return;
  }

  void navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: "CACHE_ROUTE",
      url,
    });
  });
}

export function navigateCourses(url: string, options?: { replace?: boolean }) {
  if (typeof window === "undefined") {
    return;
  }

  const method = options?.replace ? "replaceState" : "pushState";
  window.history[method](window.history.state, "", url);
  warmCoursesRoute(url);
  window.dispatchEvent(new Event(WORKSPACE_NAVIGATION_EVENT));
}

export function addCoursesNavigationListener(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("popstate", listener);
  window.addEventListener(WORKSPACE_NAVIGATION_EVENT, listener);

  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(WORKSPACE_NAVIGATION_EVENT, listener);
  };
}

export const navigateWorkspace = navigateCourses;
export const addWorkspaceNavigationListener = addCoursesNavigationListener;
