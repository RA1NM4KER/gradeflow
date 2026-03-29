"use client";

import { ChangeEvent, useRef, useState } from "react";

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
  onRestoreAppState,
}: {
  appState: AppState;
  onRestoreAppState: (state: AppState) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    fileName: string;
    state: AppState;
  } | null>(null);

  const summary = getAppStateBackupSummary(appState);

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

    const shouldReplace = window.confirm(
      `Replace your current local Gradeflow data with "${pendingImport.fileName}"? This cannot be undone inside the app.`,
    );

    if (!shouldReplace) {
      return;
    }

    onRestoreAppState(pendingImport.state);
    setPendingImport(null);
    setImportError(null);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="rounded-full border border-stone-200 bg-white/70 px-4 py-2 text-sm text-stone-700 transition hover:border-stone-300 hover:bg-white hover:text-stone-950"
          type="button"
        >
          Backup
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Local backup</DialogTitle>
          <DialogDescription>
            Export your private Gradeflow data to JSON or restore a local
            backup.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-4">
            <p className="text-sm font-semibold text-stone-900">
              Export current data
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              {summary.semesterCount} semesters and {summary.moduleCount}{" "}
              modules will be saved to a local JSON file.
            </p>
            <Button
              className="mt-4"
              onClick={() => downloadAppStateBackup(appState)}
              type="button"
            >
              Export JSON
            </Button>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-4">
            <p className="text-sm font-semibold text-stone-900">
              Import backup
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Importing replaces the current local state on this device after
              confirmation.
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
              <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-3">
                <p className="text-sm font-medium text-stone-900">
                  Ready to import {pendingImport.fileName}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {getAppStateBackupSummary(pendingImport.state).semesterCount}{" "}
                  semesters and{" "}
                  {getAppStateBackupSummary(pendingImport.state).moduleCount}{" "}
                  modules detected.
                </p>
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
            Import backup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
