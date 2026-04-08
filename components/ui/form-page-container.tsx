import { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/shared/utils";

type FormPageContainerProps = ComponentPropsWithoutRef<"div">;

export function FormPageContainer({
  children,
  className,
  ...props
}: FormPageContainerProps) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl items-center px-4 py-16 sm:px-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
