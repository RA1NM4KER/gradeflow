"use client";

import { FlaskConical, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExperimentModePill({ onStop }: { onStop: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/95 px-3 py-2 text-sky-950 shadow-card backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-sky-700 sm:h-8 sm:w-8">
          <span className="pointer-events-none absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-[7px] rounded-full bg-sky-400/70 animate-ping [animation-duration:1.8s]" />
          <span className="pointer-events-none absolute -top-1.5 left-1/2 h-1 w-1 translate-x-[2px] rounded-full bg-sky-300/80 animate-ping [animation-delay:300ms] [animation-duration:2.1s]" />
          <span className="pointer-events-none absolute top-0 left-1/2 h-1 w-1 -translate-x-[2px] rounded-full bg-sky-200/90 animate-ping [animation-delay:650ms] [animation-duration:1.6s]" />
          <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[0.82rem] font-semibold sm:text-sm">
            Experiment mode is on
          </p>
          <p className="text-[0.68rem] text-sky-900/75 sm:text-[0.72rem]">
            Test changes safely. Nothing is saved until you exit.
          </p>
        </div>
      </div>
      <Button
        className="h-8 shrink-0 rounded-full bg-white/90 px-3 text-[0.75rem] text-sky-900 hover:bg-white sm:h-9 sm:px-3.5 sm:text-[0.82rem]"
        onClick={onStop}
        size="sm"
        type="button"
        variant="secondary"
      >
        <Undo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Undo
      </Button>
    </div>
  );
}
