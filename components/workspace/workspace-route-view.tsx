"use client";

import { useEffect, useState } from "react";

import { CourseScreen } from "@/components/workspace/module-screen";
import { SemesterScreen } from "@/components/workspace/semester-screen";
import { addCoursesNavigationListener } from "@/lib/workspace-navigation";

function readWorkspaceLocation() {
  if (typeof window === "undefined") {
    return {
      moduleId: null,
      pathname: "/courses",
    };
  }

  const pathname = window.location.pathname;
  const moduleMatch =
    pathname.match(/^\/courses\/([^/]+)$/) ??
    pathname.match(/^\/workspace\/modules\/([^/]+)$/);

  return {
    moduleId: moduleMatch ? decodeURIComponent(moduleMatch[1]) : null,
    pathname,
  };
}

export function CoursesRouteView() {
  const [location, setLocation] = useState(readWorkspaceLocation);

  useEffect(() => {
    const syncLocation = () => {
      setLocation((currentLocation) => {
        const nextLocation = readWorkspaceLocation();

        if (
          currentLocation.pathname === nextLocation.pathname &&
          currentLocation.moduleId === nextLocation.moduleId
        ) {
          return currentLocation;
        }

        return nextLocation;
      });
    };

    return addCoursesNavigationListener(syncLocation);
  }, []);

  if (location.moduleId) {
    return <CourseScreen moduleId={location.moduleId} />;
  }

  return <SemesterScreen />;
}

export const WorkspaceRouteView = CoursesRouteView;
