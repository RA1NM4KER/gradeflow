"use client";

import { FlaskConical, Undo2 } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { FloatingStatusPill } from "@/components/workspace/shared/floating-status-pill";
import { getExperimentTheme } from "@/lib/grades/experiment-theme";

export function ExperimentModePill({
  onStopAction,
}: {
  onStopAction: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const experimentTheme = getExperimentTheme(resolvedTheme);

  return (
    <FloatingStatusPill
      actionIcon={<Undo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
      actionLabel="Undo"
      icon={
        <>
          <span
            className={`pointer-events-none absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-[7px] rounded-full animate-ping [animation-duration:1.8s] ${experimentTheme.accentPing1}`}
          />
          <span
            className={`pointer-events-none absolute -top-1.5 left-1/2 h-1 w-1 translate-x-[2px] rounded-full animate-ping [animation-delay:300ms] [animation-duration:2.1s] ${experimentTheme.accentPing2}`}
          />
          <span
            className={`pointer-events-none absolute top-0 left-1/2 h-1 w-1 -translate-x-[2px] rounded-full animate-ping [animation-delay:650ms] [animation-duration:1.6s] ${experimentTheme.accentPing3}`}
          />
          <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </>
      }
      onAction={onStopAction}
      subtitle="Nothing here changes your real grades. Undo to exit this preview."
      title="Experiment mode is on"
      tone="experiment"
    />
  );
}
