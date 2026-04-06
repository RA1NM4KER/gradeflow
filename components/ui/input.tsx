import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default:
          "h-10 rounded-xl border border-input bg-surface px-3.5 py-2 text-sm text-surface-foreground shadow-sm placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-ring",
        inline:
          "h-auto rounded-none border-0 bg-transparent px-0 py-0 text-sm font-medium leading-normal text-foreground shadow-none focus-visible:ring-0",
        "inline-heading":
          "h-auto rounded-none border-0 bg-transparent px-0 py-0 text-base font-medium leading-normal text-foreground shadow-none focus-visible:ring-0",
        "inline-number":
          "h-auto rounded-none border-0 bg-transparent px-0 py-0 text-sm font-medium leading-normal text-foreground shadow-none [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type InputProps = React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
