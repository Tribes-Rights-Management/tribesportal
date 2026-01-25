import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL CHECKBOX — TRIBES STANDARD (LOCKED)
 * 
 * Legal consent control pattern. Must look contractual, not consumer-grade.
 * 
 * Visual requirements:
 * - Square box (no rounded corners)
 * - Thin neutral gray border (~#c4c4c4)
 * - White/transparent interior (NEVER filled)
 * - Checked: dark checkmark only, background stays white
 * - Larger hit area for accessibility (20x20)
 */

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Square, thin border, NO fill on checked, NO rounded corners
      // Scaled to 18px to match reduced input proportions
      "peer h-[18px] w-[18px] shrink-0 rounded-none border border-border bg-background transition-colors duration-100 ease-out",
      "data-[state=checked]:border-foreground data-[state=checked]:bg-background",
      "focus-visible:outline-none focus-visible:border-ring",
      "disabled:cursor-not-allowed disabled:opacity-40",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-foreground")}>
      <Check className="h-3 w-3" strokeWidth={2.5} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
