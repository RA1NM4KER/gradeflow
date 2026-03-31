"use client";

import {
  getCourseCurrentGrade,
  getCourseGuaranteedGrade,
  getRemainingWeight,
  getSortedGradeBands,
  hasRecordedCourseGrade,
} from "@/lib/grade-utils";
import { CourseMobileOverviewChart } from "@/components/workspace/course-mobile-overview-chart";
import { CourseMobileOverviewNeededGrid } from "@/components/workspace/course-mobile-overview-needed-grid";
import { Course } from "@/lib/types";

export function CourseMobileOverview({
  module,
  isExperimenting = false,
  onSaveBands,
}: {
  module: Course;
  isExperimenting?: boolean;
  onSaveBands: (bands: Course["gradeBands"]) => void;
}) {
  const hasRecordedGrade = hasRecordedCourseGrade(module);
  const currentGrade = getCourseCurrentGrade(module);
  const guaranteedGrade = getCourseGuaranteedGrade(module);
  const remainingWeight = getRemainingWeight(module);
  const ceiling = guaranteedGrade + remainingWeight;
  const bands = getSortedGradeBands(module);

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <CourseMobileOverviewChart
          bands={bands}
          ceiling={ceiling}
          currentGrade={currentGrade}
          guaranteedGrade={guaranteedGrade}
          hasAssessments={module.assessments.length > 0}
          hasRecordedGrade={hasRecordedGrade}
          isExperimenting={isExperimenting}
          module={module}
        />
      </div>

      <CourseMobileOverviewNeededGrid
        bands={bands}
        module={module}
        onSaveBands={onSaveBands}
      />
    </div>
  );
}
