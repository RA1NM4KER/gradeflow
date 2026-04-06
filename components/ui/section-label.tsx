import * as React from "react";

import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}
