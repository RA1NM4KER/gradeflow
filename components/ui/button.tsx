import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/shared/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-card hover:bg-primary-hover",
        secondary: "bg-surface-muted text-foreground hover:bg-line/80",
        outline:
          "border border-line bg-surface text-surface-foreground hover:bg-surface-subtle",
        destructive:
          "border border-transparent bg-danger-solid text-white shadow-card hover:brightness-[0.96] disabled:border-transparent disabled:bg-danger-solid disabled:text-white",
        "destructive-soft":
          "border border-danger-soft bg-danger-soft text-danger hover:brightness-[0.98] disabled:border-line disabled:bg-surface disabled:text-ink-soft disabled:opacity-100",
        ghost: "text-ink-strong hover:bg-surface-muted",
        nav: "rounded-md px-3 py-2 text-sm font-medium text-ink-strong hover:bg-surface-muted hover:text-foreground",
        glass:
          "border border-white/28 bg-white/62 text-foreground shadow-[0_10px_24px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm hover:bg-white/82 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14",
        "glass-soft":
          "border border-white/24 bg-white/52 text-foreground shadow-[0_10px_24px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm hover:bg-white/72 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14",
        "glass-panel":
          "border border-white/24 bg-white/44 text-foreground shadow-card backdrop-blur-sm hover:bg-white/58 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/10",
        "glass-strong":
          "border border-stone-300/80 bg-stone-900 text-white shadow-[0_10px_24px_-16px_rgba(15,23,42,0.28)] hover:bg-stone-800 dark:border-white/14 dark:bg-white/18 dark:text-white dark:hover:bg-white/24",
        "glass-muted":
          "border border-white/35 bg-white/82 text-ink-muted shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)] hover:bg-white/82 dark:border-white/12 dark:bg-white/10 dark:text-ink-muted dark:hover:bg-white/10",
        "dialog-primary":
          "border border-stone-300/80 bg-stone-900 text-white shadow-[0_12px_28px_-16px_rgba(15,23,42,0.4)] hover:bg-stone-800 dark:border-white/14 dark:bg-white/18 dark:text-white dark:hover:bg-white/24",
        "dialog-muted":
          "border border-white/20 bg-white/40 text-ink-muted shadow-[0_10px_24px_rgba(28,25,23,0.04)] backdrop-blur-sm hover:bg-white/40 dark:border-white/10 dark:bg-white/5 dark:text-ink-muted dark:hover:bg-white/5",
        contrast:
          "border border-black/10 bg-black text-white shadow-[0_10px_24px_rgba(28,25,23,0.12)] hover:bg-black/90 dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-white/90",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
        icon: "h-9 w-9",
        "icon-responsive": "h-9 w-9 sm:h-10 sm:w-10",
        pill: "h-auto rounded-full px-4 py-2",
        "pill-sm":
          "h-auto rounded-[10px] px-3 py-1.5 text-[13px] sm:px-4 sm:py-2 sm:text-sm",
        panel: "h-11 rounded-[18px] px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
