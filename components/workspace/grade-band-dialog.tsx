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
  DialogTrigger,
} from "@/components/ui/dialog";
import { GradeBandEditor } from "@/components/workspace/grade-band-editor";
import { GradeBand } from "@/lib/types";

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
      <DialogTrigger asChild={triggerAsChild}>{triggerChildren}</DialogTrigger>
      <DialogContent className="flex max-h-[92vh] w-[min(94vw,640px)] flex-col overflow-hidden rounded-[28px] p-4 sm:rounded-[32px] sm:p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit cutoffs</DialogTitle>
          <DialogDescription>
            Choose the grade bands you want to track and set their cutoffs.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <GradeBandEditor bands={draftBands} onChange={setDraftBands} />
        </div>
        <DialogFooter className="shrink-0 border-t border-stone-200 bg-[#f7f4ee]/95 pt-3">
          <Button
            onClick={() => {
              onSave(draftBands);
              setOpen(false);
            }}
            type="button"
          >
            Save cutoffs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
