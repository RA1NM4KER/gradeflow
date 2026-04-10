import { Cog } from "lucide-react";

import { SemesterDialog } from "@/components/landing/semester-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SemesterSummaryStat } from "@/components/workspace/semester/semester-summary-stat";
import { formatPercent } from "@/lib/grades/grade-utils";
import { Semester } from "@/lib/shared/types";

interface SemesterSummaryStripProps {
  semester: Semester;
  semesterName: string;
  periodLabel: string;
  average: number;
  gpa: number;
  credits: number;
  onSaveSemester: (semester: Semester) => void;
}

export function SemesterSummaryStrip({
  semester,
  semesterName,
  periodLabel,
  average,
  gpa,
  credits,
  onSaveSemester,
}: SemesterSummaryStripProps) {
  const stats = [
    { label: "Grade average", value: formatPercent(average) },
    { label: "GPA", value: gpa.toFixed(2) },
    { label: "Total credits", value: String(credits) },
  ];

  return (
    <Card className="rounded-[22px] bg-[hsl(var(--surface))] px-4 py-4 sm:rounded-[26px] sm:px-6 sm:py-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.82fr)] lg:items-start lg:gap-5">
        <div className="lg:pr-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Semester
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[1.45rem] font-semibold leading-none tracking-[-0.04em] text-black dark:text-white sm:text-[1.95rem]">
              {semesterName}
            </p>
            <SemesterDialog
              onSaveSemester={onSaveSemester}
              semester={semester}
              triggerAsChild
              triggerChildren={
                <Button
                  aria-label="Edit semester"
                  className="group h-auto w-auto rounded-none border-0 bg-transparent p-0 text-ink-muted shadow-none hover:bg-transparent hover:text-ink-deep"
                  size="icon"
                  title="Edit semester"
                  type="button"
                  variant="ghost"
                >
                  <Cog className="h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-90 sm:h-5 sm:w-5" />
                </Button>
              }
            />
          </div>
          <p className="mt-1.5 max-w-xl text-[0.88rem] text-ink-soft sm:mt-2 sm:text-[0.95rem]">
            {periodLabel}
          </p>
          <p className="mt-3 max-w-2xl text-[0.84rem] leading-5 text-ink-muted sm:mt-4 sm:text-[0.92rem] sm:leading-6">
            Track all your courses for this semester in one calm view, then open
            any course to manage grades and assessment progress.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 self-start sm:gap-3 lg:grid-cols-1 xl:grid-cols-3">
          {stats.map((stat) => (
            <SemesterSummaryStat
              key={stat.label}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
