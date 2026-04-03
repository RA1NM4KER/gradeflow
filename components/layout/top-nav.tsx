"use client";

import Link from "next/link";
import { DatabaseBackup, LoaderCircle, Menu, Smartphone } from "lucide-react";
import { useState } from "react";

import { InstallAppButton } from "@/components/pwa/install-app-button";
import { LocalBackupDialog } from "@/components/pwa/local-backup-dialog";
import { ConnectDevicesDialog } from "@/components/sync/connect-devices-dialog";
import { useSyncConnection } from "@/components/sync/sync-provider";
import { formatLastSyncedAt, getSyncStatusLabel } from "@/lib/sync-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeModePanel, ThemeSelect } from "@/components/theme/theme-select";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/components/workspace/courses-provider";

export function TopNav() {
  const { appState, replaceAppState } = useCourses();
  const { isAuthenticated, lastSyncedAt, status } = useSyncConnection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const syncLabel = isAuthenticated
    ? getSyncStatusLabel(status)
    : "Connect devices";
  const syncDetail =
    isAuthenticated && status === "up-to-date"
      ? formatLastSyncedAt(lastSyncedAt)
      : null;

  function renderSyncIndicator() {
    if (status === "syncing" || status === "connecting") {
      return (
        <LoaderCircle className="h-3.5 w-3.5 animate-spin text-ink-muted" />
      );
    }

    return (
      <span
        className={
          status === "up-to-date"
            ? "h-2 w-2 rounded-full bg-emerald-500"
            : status === "offline-pending"
              ? "h-2 w-2 rounded-full bg-amber-500"
              : status === "error"
                ? "h-2 w-2 rounded-full bg-rose-500"
                : "h-2 w-2 rounded-full bg-ink-muted/40"
        }
      />
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-surface-overlay/96 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-8 sm:py-4">
        <Link
          className="flex min-w-0 shrink-0 items-center sm:gap-3"
          href="/"
          prefetch={false}
        >
          <div className="relative h-10 w-10 shrink-0 sm:h-11 sm:w-11">
            <img
              alt="GradeLog logo"
              className="object-contain"
              src="/logo.svg"
              style={{ height: "100%", width: "100%" }}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-semibold text-foreground sm:text-[0.95rem]">
              GradeLog
            </p>
            <p className="text-xs hidden sm:block text-ink-muted">
              Local-first grade tracking.
            </p>
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end">
          <nav className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:block">
              <ThemeSelect />
            </div>
            <div className="hidden sm:block">
              <ConnectDevicesDialog
                triggerAsChild
                triggerChildren={
                  <button
                    className="rounded-md px-3 py-2 text-sm font-medium text-ink-strong transition hover:bg-surface-muted hover:text-foreground"
                    type="button"
                    title={syncDetail ?? undefined}
                  >
                    <span className="inline-flex items-center gap-2">
                      {renderSyncIndicator()}
                      {syncLabel}
                    </span>
                  </button>
                }
              />
            </div>
            <div className="hidden sm:block">
              <LocalBackupDialog
                appState={appState}
                onRestoreAppStateAction={replaceAppState}
              />
            </div>
            <Link
              className="rounded-[10px] border border-white/28 bg-white/52 px-3 py-1.5 text-[13px] font-medium text-foreground shadow-[0_10px_24px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm transition hover:bg-white/72 sm:px-4 sm:py-2 sm:text-sm dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14"
              href="/"
              prefetch={false}
            >
              Semesters
            </Link>
            <button
              aria-expanded={mobileMenuOpen}
              aria-haspopup="dialog"
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center text-foreground  transition  sm:hidden"
              onClick={() => setMobileMenuOpen(true)}
              type="button"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </nav>
        </div>
      </div>

      <Dialog onOpenChange={setMobileMenuOpen} open={mobileMenuOpen}>
        <DialogContent className="left-auto right-0 top-0 grid h-dvh w-[min(86vw,320px)] max-w-none grid-rows-[auto_1fr] translate-x-0 translate-y-0 rounded-none rounded-l-[28px] border-l border-r-0 border-t-0 border-white/18 p-5 before:hidden dark:border-white/10 sm:hidden">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-lg">Menu</DialogTitle>
            <DialogDescription>
              Theme, backup, and install controls for this device.
            </DialogDescription>
          </DialogHeader>

          <div className="grid auto-rows-min content-start items-start gap-5 self-start">
            <InstallAppButton
              className="w-full justify-start"
              onInstalled={() => setMobileMenuOpen(false)}
            />

            <ThemeModePanel />

            <section className="grid gap-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Data
              </p>
              <LocalBackupDialog
                appState={appState}
                onRestoreAppStateAction={replaceAppState}
                triggerAsChild
                triggerChildren={
                  <Button
                    className="w-full justify-start gap-2 rounded-[18px] border-white/24 bg-white/44 px-4 text-left shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-white/6"
                    variant="outline"
                  >
                    <DatabaseBackup className="h-4 w-4" />
                    Backup and restore
                  </Button>
                }
              />
              <ConnectDevicesDialog
                triggerAsChild
                triggerChildren={
                  <Button
                    className="w-full justify-start gap-2 rounded-[18px] border-white/24 bg-white/44 px-4 text-left shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-white/6"
                    variant="outline"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span className="inline-flex items-center gap-2">
                      {renderSyncIndicator()}
                      {isAuthenticated ? syncLabel : "Connect your devices"}
                    </span>
                  </Button>
                }
              />
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
