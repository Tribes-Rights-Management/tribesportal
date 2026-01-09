import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // INSTITUTIONAL FORM FIELD (LOCKED)
        // - Reduced padding (py-2.5), matches input scale
        // - Neutral gray border, white bg
        // - Focus: border darkens, no ring/glow
        "flex min-h-[110px] w-full rounded-md border border-[#d4d4d4] bg-white px-3 py-2.5 text-[15px] leading-normal text-foreground placeholder:text-muted-foreground/60 transition-colors duration-150 ease-out focus:outline-none focus:border-[#737373] disabled:cursor-not-allowed disabled:bg-[#fafafa] disabled:opacity-60 resize-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
