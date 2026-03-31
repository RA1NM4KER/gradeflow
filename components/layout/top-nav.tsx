"use client";

import Link from "next/link";
import { BookOpenText } from "lucide-react";

import { LocalBackupDialog } from "@/components/pwa/local-backup-dialog";
import { useCourses } from "@/components/workspace/workspace-provider";

export function TopNav() {
  const { appState, replaceAppState } = useCourses();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-white/96 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-8 sm:py-4">
        <Link
          className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
          href="/"
          prefetch={false}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border-2 border-stone-950 bg-white text-stone-950 shadow-[0_1px_0_rgba(255,255,255,0.7)] sm:h-9 sm:w-9">
            <BookOpenText className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.82rem] font-semibold text-stone-950 sm:text-sm">
              Gradeflow
            </p>
            <p className="hidden text-xs text-stone-500 sm:block">
              Local-first grade tracking.
            </p>
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end">
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950 sm:px-3 sm:py-2 sm:text-[15px]"
              href="/courses"
              prefetch={false}
            >
              Courses
            </Link>
            <LocalBackupDialog
              appState={appState}
              onRestoreAppState={replaceAppState}
            />
            <Link
              className="rounded-[10px] bg-[#0b6ee6] px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#0a63ce] sm:px-4 sm:py-2 sm:text-sm"
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
