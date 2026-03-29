"use client";

import Link from "next/link";
import { BookOpenText } from "lucide-react";

import { InstallButton } from "@/components/pwa/install-button";
import { LocalBackupDialog } from "@/components/pwa/local-backup-dialog";
import { useWorkspace } from "@/components/workspace/workspace-provider";

export function TopNav() {
  const { appState, replaceAppState } = useWorkspace();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#f6f2ea]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link className="flex items-center gap-3" href="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-stone-50 shadow-card">
            <BookOpenText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Gradeflow
            </p>
            <p className="text-sm text-stone-700">
              Local-first grade tracking.
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <InstallButton />
          <LocalBackupDialog
            appState={appState}
            onRestoreAppState={replaceAppState}
          />
          <nav className="hidden items-center gap-1 rounded-full border border-stone-200 bg-white/70 p-1 md:flex">
            <Link
              className="rounded-full px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
              href="/"
            >
              Home
            </Link>
            <Link
              className="rounded-full px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
              href="/workspace"
            >
              Workspace
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
