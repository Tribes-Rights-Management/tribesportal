import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Stripe-like compact input: 36px height, 6px radius
          "flex h-9 w-full rounded-md border border-border bg-card px-3 text-[13px] leading-normal text-foreground placeholder:text-muted-foreground/60 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
