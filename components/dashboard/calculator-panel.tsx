import { Sparkles, Target } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  calculateRequiredScore,
  formatPercent,
  getSecuredContribution,
  getRemainingWeight,
} from "@/lib/grade-utils";
import { Course } from "@/lib/types";

interface CalculatorPanelProps {
  course: Course;
  targetGrade: number;
  onTargetGradeChange: (value: number) => void;
}

export function CalculatorPanel({
  course,
  targetGrade,
  onTargetGradeChange,
}: CalculatorPanelProps) {
  const result = calculateRequiredScore(course, targetGrade);
  const secured = getSecuredContribution(course);
  const remainingWeight = getRemainingWeight(course);

  return (
    <Card className="overflow-hidden border-stone-900/10 bg-stone-950 text-stone-50">
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-stone-300">
              <Sparkles className="h-3.5 w-3.5" />
              Required score calculator
            </div>
            <CardTitle className="text-stone-50">
              What do you need to get?
            </CardTitle>
            <CardDescription className="text-stone-400">
              Pressure-test your target before the next major submission lands.
            </CardDescription>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 md:flex">
            <Target className="h-5 w-5 text-stone-200" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                Target final grade
              </p>
              <p className="mt-3 text-5xl font-semibold tracking-tight text-white">
                {targetGrade}%
              </p>
            </div>
            <div className="text-right text-sm text-stone-400">
              <p>{course.code}</p>
              <p>{course.name}</p>
            </div>
          </div>
          <input
            aria-label="Target grade"
            className="mt-6 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-white"
            max={95}
            min={50}
            onChange={(event) =>
              onTargetGradeChange(Number(event.target.value))
            }
            type="range"
            value={targetGrade}
          />
          <div className="mt-3 flex justify-between text-xs uppercase tracking-[0.18em] text-stone-500">
            <span>50%</span>
            <span>95%</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
              Secured so far
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formatPercent(secured)}
            </p>
            <p className="mt-2 text-sm text-stone-400">
              Weighted points already locked in.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
              Remaining weight
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formatPercent(remainingWeight)}
            </p>
            <p className="mt-2 text-sm text-stone-400">
              Still available across open assessments.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
              Needed average
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {result.remainingWeight === 0
                ? "Closed"
                : `${result.neededAverage}%`}
            </p>
            <p className="mt-2 text-sm text-stone-400">
              Across all remaining graded work.
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-medium text-white">
                {result.achievable
                  ? "This target is still within reach."
                  : "This target is no longer mathematically reachable."}
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-400">
                {result.message}
              </p>
            </div>
            <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-stone-300">
              Needed points:{" "}
              {result.neededPoints > 0
                ? formatPercent(result.neededPoints)
                : "0%"}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-sm text-stone-400">
              <span>Progress toward target</span>
              <span>
                {Math.min((secured / targetGrade) * 100, 100).toFixed(0)}%
              </span>
            </div>
            <Progress
              className="bg-white/10"
              value={Math.min((secured / targetGrade) * 100, 100)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
