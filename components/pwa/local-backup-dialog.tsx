"use client";

import { ChangeEvent, ReactNode, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTriggerAction } from "@/components/ui/dialog-trigger-action";
import {
  downloadAppStateBackup,
  getAppStateBackupSummary,
  importAppStateBackup,
} from "@/lib/app/app-state-backup";
import { AppState } from "@/lib/app/types";

export function LocalBackupDialog({
  appState,
  onRestoreAppStateAction,
  triggerAsChild = false,
  triggerChildren,
}: {
  appState: AppState;
  onRestoreAppStateAction: (state: AppState) => void;
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    fileName: string;
    lastModified: string | null;
    state: AppState;
  } | null>(null);

  const summary = getAppStateBackupSummary(appState);
  const pendingImportSummary = useMemo(
    () =>
      pendingImport ? getAppStateBackupSummary(pendingImport.state) : null,
    [pendingImport],
  );

  function resetImportState() {
    setImportError(null);
    setIsImporting(false);
    setPendingImport(null);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setPendingImport(null);

    try {
      const importedState = await importAppStateBackup(file);
      setPendingImport({
        fileName: file.name,
        lastModified:
          file.lastModified > 0
            ? new Date(file.lastModified).toLocaleString()
            : null,
        state: importedState,
      });
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "This file could not be imported into GradeLog.",
      );
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  }

  function confirmImport() {
    if (!pendingImport) {
      return;
    }

    onRestoreAppStateAction(pendingImport.state);
    setPendingImport(null);
    setImportError(null);
    setOpen(false);
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          resetImportState();
        }
      }}
      open={open}
    >
      <DialogTriggerAction
        asChild={triggerAsChild}
        fallback={
          <Button size={null} type="button" variant="nav">
            Backup
          </Button>
        }
      >
        {triggerChildren}
      </DialogTriggerAction>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Local backup</DialogTitle>
          <DialogDescription>
            Export your private GradeLog data to JSON or restore a local backup
            on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <Card className="rounded-[24px]" variant="glass-panel">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-foreground">
                Export current data
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">
                Version {summary.version}. {summary.semesterCount} semesters,{" "}
                {summary.courseCount} courses, and {summary.assessmentCount}{" "}
                assessments will be saved to a local JSON file.
              </p>
              <Button
                className="mt-4"
                onClick={() => downloadAppStateBackup(appState)}
                type="button"
              >
                Export JSON
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[24px]" variant="glass-panel">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-foreground">
                Import backup
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">
                Review the backup before replacing the current local state on
                this device.
              </p>
              <input
                accept="application/json,.json"
                className="hidden"
                onChange={handleFileChange}
                ref={inputRef}
                type="file"
              />
              <Button
                className="mt-4"
                onClick={() => inputRef.current?.click()}
                type="button"
                variant="outline"
              >
                Choose JSON file
              </Button>

              {isImporting ? (
                <p className="mt-3 text-sm text-ink-muted">
                  Checking backup file…
                </p>
              ) : null}

              {importError ? (
                <p className="mt-3 text-sm text-danger">{importError}</p>
              ) : null}

              {pendingImport ? (
                <div className="mt-3 rounded-2xl border border-white/20 bg-white/44 p-3 shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-white/6">
                  <p className="text-sm font-medium text-foreground">
                    Ready to import {pendingImport.fileName}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Version {pendingImportSummary?.version}.{" "}
                    {pendingImportSummary?.semesterCount} semesters,{" "}
                    {pendingImportSummary?.courseCount} courses, and{" "}
                    {pendingImportSummary?.assessmentCount} assessments
                    detected.
                  </p>
                  {pendingImport.lastModified ? (
                    <p className="mt-1 text-sm text-ink-muted">
                      File updated {pendingImport.lastModified}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            disabled={!pendingImport}
            onClick={confirmImport}
            type="button"
          >
            Replace local data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
