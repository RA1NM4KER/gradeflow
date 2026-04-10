"use client";

import { useSyncExternalStore } from "react";

import { isNativeApp } from "@/lib/platform/platform";

const WORKSPACE_NAVIGATION_EVENT = "gradeflow:workspace-navigation";
const DEFAULT_COURSES_LOCATION: CoursesLocationState = {
  moduleId: null,
  pathname: "/courses",
  scope: "semester",
  semesterId: null,
};
let cachedCoursesLocation = DEFAULT_COURSES_LOCATION;
let cachedCoursesLocationKey = "";

export interface CoursesLocationState {
  moduleId: string | null;
  pathname: string;
  scope: "all" | "semester";
  semesterId: string | null;
}

function warmCoursesRoute(url: string) {
  if (
    typeof window === "undefined" ||
    isNativeApp() ||
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

export function readCoursesLocation(): CoursesLocationState {
  if (typeof window === "undefined") {
    return DEFAULT_COURSES_LOCATION;
  }

  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const moduleMatch =
    pathname.match(/^\/courses\/([^/]+)$/) ??
    pathname.match(/^\/workspace\/modules\/([^/]+)$/);
  const moduleId =
    searchParams.get("course") ??
    (moduleMatch ? decodeURIComponent(moduleMatch[1]) : null);
  const scope = searchParams.get("scope") === "all" ? "all" : "semester";
  const semesterId = searchParams.get("semester");
  const nextCacheKey = `${pathname}::${scope}::${semesterId ?? ""}::${moduleId ?? ""}`;

  if (nextCacheKey === cachedCoursesLocationKey) {
    return cachedCoursesLocation;
  }

  cachedCoursesLocationKey = nextCacheKey;
  cachedCoursesLocation = {
    moduleId,
    pathname,
    scope,
    semesterId,
  };

  return cachedCoursesLocation;
}

export function useCoursesLocation() {
  return useSyncExternalStore(
    addCoursesNavigationListener,
    readCoursesLocation,
    () => DEFAULT_COURSES_LOCATION,
  );
}
