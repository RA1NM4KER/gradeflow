import { ComponentPropsWithoutRef } from "react";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/shared/utils";

type LoadingMessageProps = ComponentPropsWithoutRef<"p"> & {
  size?: "sm" | "md" | "lg";
};

export function LoadingMessage({
  children,
  className,
  size = "md",
  ...props
}: LoadingMessageProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-sm text-ink-muted",
        className,
      )}
      {...props}
    >
      <LoadingSpinner size={size} />
      {children}
    </p>
  );
}
