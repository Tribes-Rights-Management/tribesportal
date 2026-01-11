import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Marketing site alignment:
          // - Height: 52px, radius: 14px
          // - Border: rgba(0,0,0,0.18)
          // - Placeholder: rgba(11,15,20,0.35)
          // - Focus: subtle ring with rgba(0,0,0,0.12)
          // - Transition: 180-220ms cubic-bezier
          "flex h-[52px] w-full rounded-[14px] border border-[rgba(0,0,0,0.18)] bg-white px-4 py-3 text-base leading-normal text-foreground placeholder:text-[rgba(11,15,20,0.35)] transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus:outline-none focus:border-foreground focus:ring-2 focus:ring-[rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:bg-[#fafafa] disabled:opacity-45",
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
