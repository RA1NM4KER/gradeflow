import { ReactNode } from "react";

import { cn } from "@/lib/shared/utils";

export function CourseTemplateChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
