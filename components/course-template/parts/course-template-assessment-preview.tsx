import { Card } from "@/components/ui/card";
import { CourseTemplateAssessment } from "@/lib/course/types";
import { CourseTemplateChip } from "./course-template-chip";

export function CourseTemplateAssessmentPreview({
  assessment,
}: {
  assessment: CourseTemplateAssessment;
}) {
  return (
    <Card className="rounded-[18px] px-4 py-3" variant="surface-subtle">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {assessment.name}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {assessment.kind === "group"
              ? "Tutorial group"
              : assessment.category}
            {assessment.dueDate ? ` · Due ${assessment.dueDate}` : ""}
          </p>
        </div>
        <CourseTemplateChip className="bg-surface-panel text-ink-soft">
          {assessment.weight}%
        </CourseTemplateChip>
      </div>
      {assessment.kind === "group" ? (
        <p className="mt-2 text-xs text-ink-soft">
          {assessment.items.length} items · drop lowest {assessment.dropLowest}
        </p>
      ) : (
        <p className="mt-2 text-xs text-ink-soft">
          Total possible: {assessment.totalPossible}
        </p>
      )}
    </Card>
  );
}
