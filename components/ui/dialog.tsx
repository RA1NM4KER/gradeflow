import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const dialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid w-[calc(100vw-1rem)] max-w-[640px] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-hidden rounded-[28px] border border-white/30 bg-surface-dialog/82 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.28),0_1px_0_rgba(255,255,255,0.5)_inset] backdrop-blur-xl duration-200 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-20 before:bg-gradient-to-b before:from-white/38 before:via-white/12 before:to-transparent sm:w-[min(92vw,640px)] sm:rounded-[32px] sm:p-6 dark:border-white/10 dark:before:from-white/8 dark:before:via-white/2",
  {
    variants: {
      layout: {
        default: "",
        workspace: "flex max-h-[92vh] w-[min(94vw,640px)] flex-col",
        "workspace-compact": "flex max-h-[92vh] w-[min(94vw,560px)] flex-col",
        "workspace-wide":
          "flex max-h-[92vh] w-[min(94vw,640px)] flex-col sm:max-w-4xl",
      },
    },
    defaultVariants: {
      layout: "default",
    },
  },
);

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-overlay/18 backdrop-blur-md",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof dialogContentVariants>
>(({ className, children, layout, onClick, onPointerDown, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogContentVariants({ layout }), className)}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onPointerDown?.(event);
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className="absolute right-3 top-3 z-10 rounded-full p-2 text-ink-muted transition hover:bg-white/45 hover:text-foreground sm:right-5 sm:top-5 dark:hover:bg-white/8"
        type="button"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-left", className)}
    {...props}
  />
);

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-3 border-t border-white/20 pt-4 sm:flex-row sm:justify-end dark:border-white/8",
      className,
    )}
    {...props}
  />
);

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-2xl font-semibold tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-ink-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  dialogContentVariants,
};
