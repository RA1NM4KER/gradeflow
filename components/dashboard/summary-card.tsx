import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}

export function SummaryCard({ label, value, detail, icon }: SummaryCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-stone-900 via-stone-700 to-stone-400" />
      <CardContent className="p-6">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              {label}
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-stone-950">
              {value}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100/80 text-stone-800">
            {icon}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-stone-600">{detail}</p>
      </CardContent>
    </Card>
  );
}
