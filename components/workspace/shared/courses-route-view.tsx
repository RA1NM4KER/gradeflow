"use client";

import { CourseScreen } from "@/components/workspace/course/module-screen";
import { SemesterScreen } from "@/components/workspace/semester/semester-screen";
import { useCoursesLocation } from "@/lib/course/courses-navigation";

export function CoursesRouteView() {
  const location = useCoursesLocation();

  if (location.moduleId) {
    return <CourseScreen moduleId={location.moduleId} />;
  }

  return <SemesterScreen />;
}
