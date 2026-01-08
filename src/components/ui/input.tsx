import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Institutional-grade form field (LOCKED)
          // Height: 48px, subtle radius, neutral gray border, white bg
          // Focus: border darkens, no ring/glow
          "flex h-12 w-full rounded-md border border-[#d4d4d4] bg-white px-4 py-2 text-[15px] text-foreground placeholder:text-muted-foreground/60 transition-colors duration-150 ease-out focus:outline-none focus:border-[#737373] disabled:cursor-not-allowed disabled:bg-[#fafafa] disabled:opacity-60",
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
