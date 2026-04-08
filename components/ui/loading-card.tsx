import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/shared/utils";

type LoadingCardProps = {
  cardClassName?: string;
  className?: string;
  message: ReactNode;
};

export function LoadingCard({
  cardClassName,
  className,
  message,
}: LoadingCardProps) {
  return (
    <Card
      className={cn("rounded-[24px]", cardClassName)}
      variant="surface-panel"
    >
      <CardContent
        className={cn(
          "flex min-h-[18rem] flex-col items-center justify-center gap-3 p-6",
          className,
        )}
      >
        <LoadingSpinner className="text-ink-muted" size="lg" />
        <p className="text-sm text-ink-soft">{message}</p>
      </CardContent>
    </Card>
  );
}
