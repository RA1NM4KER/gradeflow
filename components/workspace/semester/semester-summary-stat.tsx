interface SemesterSummaryStatProps {
  label: string;
  value: string;
}

export function SemesterSummaryStat({
  label,
  value,
}: SemesterSummaryStatProps) {
  return (
    <div className="rounded-[16px] bg-[hsl(var(--surface-subtle))] px-2.5 py-2.5 sm:rounded-[20px] sm:px-4 sm:py-3.5">
      <p className="min-h-[1.55rem] text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-ink-muted sm:min-h-[2.8rem] sm:text-[0.68rem] sm:tracking-[0.16em]">
        {label}
      </p>
      <p className="text-[1.2rem] font-semibold tracking-[-0.035em] text-foreground sm:mt-2 sm:text-[1.75rem] sm:tracking-[-0.05em]">
        {value}
      </p>
    </div>
  );
}
