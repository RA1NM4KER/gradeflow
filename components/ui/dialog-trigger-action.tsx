"use client";

import { ReactNode } from "react";

import { DialogTrigger } from "@/components/ui/dialog";

interface DialogTriggerActionProps {
  asChild?: boolean;
  children?: ReactNode;
  fallback?: ReactNode;
}

export function DialogTriggerAction({
  asChild = false,
  children,
  fallback,
}: DialogTriggerActionProps) {
  if (children) {
    return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>;
  }

  if (!fallback) {
    return null;
  }

  return <DialogTrigger asChild>{fallback}</DialogTrigger>;
}
