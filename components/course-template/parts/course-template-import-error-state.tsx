import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function CourseTemplateImportErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <Card className="rounded-[28px] border-danger-soft bg-danger-soft">
      <CardContent className="flex items-start gap-3 p-6">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-danger" />
        <div>
          <h2 className="text-lg font-semibold text-danger-strong">
            Course setup unavailable
          </h2>
          <p className="mt-1 text-sm text-danger">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
