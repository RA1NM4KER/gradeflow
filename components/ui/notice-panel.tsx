import { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/shared/utils";

type NoticeTone = "success" | "warning" | "error";

type NoticePanelProps = ComponentPropsWithoutRef<"div"> & {
  tone?: NoticeTone;
};

const toneClasses: Record<NoticeTone, string> = {
  success: "border-success-soft bg-success-soft text-success-strong",
  warning: "border-warning-soft bg-warning-soft text-warning-strong",
  error: "border-danger-soft bg-danger-soft text-danger",
};

export function NoticePanel({
  children,
  className,
  tone = "warning",
  ...props
}: NoticePanelProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border p-4 text-sm",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
