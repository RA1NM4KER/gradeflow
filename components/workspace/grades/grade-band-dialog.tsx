"use client";

import { ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTriggerAction } from "@/components/ui/dialog-trigger-action";
import { GradeBandEditorSection } from "@/components/workspace/grades/grade-band-editor-section";
import { GradeBand } from "@/lib/shared/types";

interface GradeBandDialogProps {
  bands: GradeBand[];
  onSave: (bands: GradeBand[]) => void;
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function GradeBandDialog({
  bands,
  onSave,
  triggerAsChild = false,
  triggerChildren,
}: GradeBandDialogProps) {
  const [open, setOpen] = useState(false);
  const [draftBands, setDraftBands] = useState(bands);

  useEffect(() => {
    if (open) {
      setDraftBands(bands);
    }
  }, [bands, open]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTriggerAction asChild={triggerAsChild}>
        {triggerChildren}
      </DialogTriggerAction>
      <DialogContent layout="workspace">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit cutoffs</DialogTitle>
          <DialogDescription>
            Choose the grade bands you want to track and set their cutoffs.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <GradeBandEditorSection
            bands={draftBands}
            onChange={setDraftBands}
            showHeading={false}
          />
        </div>
        <DialogFooter className="shrink-0 pt-3">
          <Button
            onClick={() => {
              onSave(draftBands);
              setOpen(false);
            }}
            type="button"
            variant="contrast"
          >
            Save cutoffs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
