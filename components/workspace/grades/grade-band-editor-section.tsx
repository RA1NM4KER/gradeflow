"use client";

import { GradeBandEditor } from "@/components/workspace/grades/grade-band-editor";
import { GradeBand } from "@/lib/shared/types";

interface GradeBandEditorSectionProps {
  bands: GradeBand[];
  description?: string;
  onChange: (bands: GradeBand[]) => void;
  showHeading?: boolean;
  title?: string;
}

export function GradeBandEditorSection({
  bands,
  description = "Choose the grade bands you want to track and set their cutoffs.",
  onChange,
  showHeading = true,
  title = "Edit cutoffs",
}: GradeBandEditorSectionProps) {
  return (
    <div className="grid gap-4">
      {showHeading ? (
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-ink-soft">{description}</p>
        </div>
      ) : null}
      <GradeBandEditor bands={bands} onChange={onChange} />
    </div>
  );
}
