import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function CourseTemplateImportPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className} variant="surface-panel">
      <CardContent className="p-5 sm:p-6">{children}</CardContent>
    </Card>
  );
}
