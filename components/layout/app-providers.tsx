import { ReactNode } from "react";

import { SyncProvider } from "@/components/sync/sync-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CoursesProvider } from "@/components/workspace/shared/courses-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SyncProvider>
        <CoursesProvider>{children}</CoursesProvider>
      </SyncProvider>
    </ThemeProvider>
  );
}
