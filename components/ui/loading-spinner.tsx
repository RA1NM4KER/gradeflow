import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/shared/utils";

type LoadingSpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6",
} as const;

export function LoadingSpinner({
  className,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <LoaderCircle
      aria-hidden="true"
      className={cn("animate-spin", sizeClasses[size], className)}
    />
  );
}
