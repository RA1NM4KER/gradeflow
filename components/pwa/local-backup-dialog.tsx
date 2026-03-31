"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  downloadAppStateBackup,
  getAppStateBackupSummary,
  importAppStateBackup,
} from "@/lib/app-state-backup";
import { AppState } from "@/lib/app-state";

export function LocalBackupDialog({
  appState,
  onRestoreAppStateAction,
}: {
  appState: AppState;
  onRestoreAppStateAction: (state: AppState) => void;
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
          : "This file could not be imported into Gradeflow.",
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
      <DialogTrigger asChild>
        <button
          className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
          type="button"
        >
          Backup
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Local backup</DialogTitle>
          <DialogDescription>
            Export your private Gradeflow data to JSON or restore a local backup
            on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="rounded-[24px] bg-[#fbfbfa] p-4 shadow-card">
            <p className="text-sm font-semibold text-stone-900">
              Export current data
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-600">
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
          </div>

          <div className="rounded-[24px] bg-[#fbfbfa] p-4 shadow-card">
            <p className="text-sm font-semibold text-stone-900">
              Import backup
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Review the backup before replacing the current local state on this
              device.
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
              <p className="mt-3 text-sm text-stone-500">
                Checking backup file…
              </p>
            ) : null}

            {importError ? (
              <p className="mt-3 text-sm text-red-700">{importError}</p>
            ) : null}

            {pendingImport ? (
              <div className="mt-3 rounded-2xl bg-white p-3 shadow-card">
                <p className="text-sm font-medium text-stone-900">
                  Ready to import {pendingImport.fileName}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  Version {pendingImportSummary?.version}.{" "}
                  {pendingImportSummary?.semesterCount} semesters,{" "}
                  {pendingImportSummary?.courseCount} courses, and{" "}
                  {pendingImportSummary?.assessmentCount} assessments detected.
                </p>
                {pendingImport.lastModified ? (
                  <p className="mt-1 text-sm text-stone-500">
                    File updated {pendingImport.lastModified}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
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
