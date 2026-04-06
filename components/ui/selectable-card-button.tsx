import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const selectableCardButtonVariants = cva(
  "rounded-[20px] border text-left transition sm:rounded-[24px]",
  {
    variants: {
      tone: {
        active:
          "border-white/35 bg-white/62 text-foreground shadow-[0_10px_24px_rgba(28,25,23,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-white/10",
        inactive:
          "border-white/22 bg-white/28 text-foreground hover:border-white/35 hover:bg-white/42 dark:border-white/8 dark:bg-white/4 dark:hover:bg-white/8",
      },
      size: {
        default: "px-3 py-3 sm:px-4 sm:py-4",
        compact:
          "rounded-[18px] px-3 py-3 text-sm font-medium sm:rounded-[20px] sm:px-4 sm:py-3.5",
      },
    },
    defaultVariants: {
      tone: "inactive",
      size: "default",
    },
  },
);

type SelectableCardButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof selectableCardButtonVariants>;

const SelectableCardButton = React.forwardRef<
  HTMLButtonElement,
  SelectableCardButtonProps
>(({ className, size, tone, type = "button", ...props }, ref) => (
  <button
    className={cn(selectableCardButtonVariants({ size, tone }), className)}
    ref={ref}
    type={type}
    {...props}
  />
));
SelectableCardButton.displayName = "SelectableCardButton";

export { SelectableCardButton, selectableCardButtonVariants };
