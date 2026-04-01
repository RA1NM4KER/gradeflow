"use client";

import Link from "next/link";
import { BookOpenText } from "lucide-react";

import { LocalBackupDialog } from "@/components/pwa/local-backup-dialog";
import { ThemeSelect } from "@/components/theme/theme-select";
import { useCourses } from "@/components/workspace/courses-provider";

export function TopNav() {
  const { appState, replaceAppState } = useCourses();

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-surface-overlay/96 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-8 sm:py-4">
        <Link
          className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
          href="/"
          prefetch={false}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border-2 border-primary bg-surface text-surface-foreground shadow-[0_1px_0_rgba(255,255,255,0.7)] sm:h-9 sm:w-9">
            <BookOpenText className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.82rem] font-semibold text-foreground sm:text-sm">
              GradeLog
            </p>
            <p className="hidden text-xs text-ink-muted sm:block">
              Local-first grade tracking.
            </p>
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end">
          <nav className="flex items-center gap-1 sm:gap-2">
            <ThemeSelect />
            <LocalBackupDialog
              appState={appState}
              onRestoreAppStateAction={replaceAppState}
            />
            <Link
              className="rounded-[10px] border border-white/28 bg-white/52 px-3 py-1.5 text-[13px] font-medium text-foreground shadow-[0_10px_24px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm transition hover:bg-white/72 sm:px-4 sm:py-2 sm:text-sm dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14"
              href="/"
              prefetch={false}
            >
              Semesters
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
