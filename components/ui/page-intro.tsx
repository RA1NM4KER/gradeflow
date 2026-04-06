import * as React from "react";

import { cn } from "@/lib/utils";

export function PageIntro({
  badge,
  children,
  className,
  description,
  descriptionClassName,
  maxWidthClassName = "max-w-3xl",
  title,
}: {
  badge: string;
  children?: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  descriptionClassName?: string;
  maxWidthClassName?: string;
  title: React.ReactNode;
}) {
  return (
    <div className={cn(maxWidthClassName, className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {badge}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2.2rem]">
        {title}
      </h1>
      {description ? (
        <div
          className={cn(
            "mt-3 text-sm leading-6 text-ink-soft sm:text-[0.98rem]",
            descriptionClassName,
          )}
        >
          {description}
        </div>
      ) : null}
      {children}
    </div>
  );
}
