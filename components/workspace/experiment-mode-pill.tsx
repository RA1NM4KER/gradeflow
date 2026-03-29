"use client";

import { FlaskConical, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExperimentModePill({ onStop }: { onStop: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-full border border-sky-200 bg-sky-50/95 px-4 py-3 text-sky-950 shadow-card backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-sky-700">
          <FlaskConical className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Experiment mode is on</p>
          <p className="text-sm text-sky-800/80">
            Try grade changes freely. Nothing here will be kept.
          </p>
        </div>
      </div>
      <Button
        className="shrink-0 bg-white/90 text-sky-900 hover:bg-white"
        onClick={onStop}
        size="sm"
        type="button"
        variant="secondary"
      >
        <Undo2 className="h-4 w-4" />
        Back to saved
      </Button>
    </div>
  );
}
