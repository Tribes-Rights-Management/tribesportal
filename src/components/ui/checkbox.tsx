import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

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
 * - Indeterminate: horizontal line (Minus icon) for "some selected"
 * - Larger hit area for accessibility (18x18)
 */

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, checked, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    checked={checked}
    className={cn(
      "peer h-[18px] w-[18px] shrink-0 bg-background transition-colors duration-100 ease-out",
      "data-[state=checked]:bg-background",
      "data-[state=indeterminate]:bg-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
      "disabled:cursor-not-allowed disabled:opacity-40",
      className,
    )}
    style={{ 
      borderRadius: 0,
      border: 'none',
      boxShadow: 'inset 0 0 0 1.5px #888',
    }}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-foreground")}>
      {checked === "indeterminate" ? (
        <Minus className="h-3 w-3" strokeWidth={2.5} />
      ) : (
        <Check className="h-3 w-3" strokeWidth={2.5} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
