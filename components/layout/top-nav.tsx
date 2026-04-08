"use client";

import Image from "next/image";
import Link from "next/link";
import { DatabaseBackup, Menu, Smartphone } from "lucide-react";
import { useState } from "react";

import { InstallAppButton } from "@/components/pwa/install-app-button";
import { LocalBackupDialog } from "@/components/pwa/local-backup-dialog";
import { ConnectDevicesDialog } from "@/components/sync/connect-devices-dialog";
import { useSyncConnection } from "@/components/sync/sync-provider";
import { formatLastSyncedAt, getSyncStatusLabel } from "@/lib/sync/sync-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeModePanel, ThemeSelect } from "@/components/theme/theme-select";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCourses } from "@/components/workspace/shared/courses-provider";
import {
  SYNC_STATUS_CONNECTING,
  SYNC_STATUS_ERROR,
  SYNC_STATUS_OFFLINE_PENDING,
  SYNC_STATUS_SYNCING,
  SYNC_STATUS_UP_TO_DATE,
} from "@/lib/sync/types";

export function TopNav() {
  const { appState, replaceAppState } = useCourses();
  const { isAuthenticated, lastSyncedAt, status } = useSyncConnection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const syncLabel = isAuthenticated
    ? getSyncStatusLabel(status)
    : "Connect devices";
  const syncDetail =
    isAuthenticated && status === SYNC_STATUS_UP_TO_DATE
      ? formatLastSyncedAt(lastSyncedAt)
      : null;

  function renderSyncIndicator() {
    if (status === SYNC_STATUS_SYNCING || status === SYNC_STATUS_CONNECTING) {
      return <LoadingSpinner className="text-ink-muted" size="sm" />;
    }

    return (
      <span
        className={
          status === SYNC_STATUS_UP_TO_DATE
            ? "h-2 w-2 rounded-full bg-success-solid"
            : status === SYNC_STATUS_OFFLINE_PENDING
              ? "h-2 w-2 rounded-full bg-warning-solid"
              : status === SYNC_STATUS_ERROR
                ? "h-2 w-2 rounded-full bg-danger-solid"
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
            <Image
              alt="GradeLog logo"
              className="object-contain"
              fill
              sizes="44px"
              src="/logo.svg"
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
                  <Button
                    size={null}
                    variant="nav"
                    type="button"
                    title={syncDetail ?? undefined}
                  >
                    <span className="inline-flex items-center gap-2">
                      {renderSyncIndicator()}
                      {syncLabel}
                    </span>
                  </Button>
                }
              />
            </div>
            <div className="hidden sm:block">
              <LocalBackupDialog
                appState={appState}
                onRestoreAppStateAction={replaceAppState}
              />
            </div>
            <Button asChild size="pill-sm" variant="glass-soft">
              <Link href="/" prefetch={false}>
                Semesters
              </Link>
            </Button>
            <Button
              aria-expanded={mobileMenuOpen}
              aria-haspopup="dialog"
              aria-label="Open menu"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(true)}
              size="icon-responsive"
              type="button"
              variant="ghost"
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>
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
              onInstalledAction={() => setMobileMenuOpen(false)}
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
                    className="w-full justify-start text-left"
                    size="panel"
                    variant="glass-panel"
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
                    className="w-full justify-start text-left"
                    size="panel"
                    variant="glass-panel"
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
