"use client";

import { ReactNode } from "react";

import { CoursesRouteView } from "@/components/workspace/workspace-route-view";

export default function CoursesLayout({ children }: { children: ReactNode }) {
  void children;

  return <CoursesRouteView />;
}
