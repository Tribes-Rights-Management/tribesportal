import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * BUTTON — CANONICAL UI PRIMITIVE (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * DO NOT STYLE BUTTONS PER-PAGE. USE VARIANTS HERE.
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This is the base button component. Most pages should use:
 * - AppButton from @/components/app-ui (for workstation pages)
 * - ConsoleButton from @/components/console (for admin console pages)
 * 
 * Both of those components wrap this primitive and add specialized features.
 * 
 * MERCURY/STRIPE-LIKE NEUTRAL BUTTON SYSTEM:
 * - NO BLACK BUTTONS — all primary buttons use neutral grey
 * - NO BLUE FILLS — blue (#0071E3) only for focus rings
 * 
 * VARIANTS:
 * - default: Light grey fill with subtle border (primary action)
 * - secondary: Same as default for consistency
 * - outline: Same as default (light grey fill)
 * - ghost: Transparent until hover
 * - destructive: Red border on transparent
 * - link: Text only with underline on hover
 * 
 * Focus ring: #0071E3 (brand blue) ONLY — no blue fills anywhere
 * ═══════════════════════════════════════════════════════════════════════════
 */

const buttonVariants = cva(
  // Base: Institutional button system - Mercury/Stripe neutrals, no blue fills, NO BLACK
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Light grey fill — Mercury-like neutral (NO BLACK)
        default: "bg-[var(--btn-bg)] text-[var(--btn-text)] border border-[var(--btn-border)] font-medium hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-border-hover)]",
        // Destructive: Red border on transparent
        destructive: "bg-transparent border border-destructive text-destructive font-medium hover:bg-destructive/10",
        // Outline: Same as default — light grey fill with border
        outline: "bg-[var(--btn-bg)] text-[var(--btn-text)] border border-[var(--btn-border)] font-medium hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-border-hover)]",
        // Secondary: Same as default for consistency
        secondary: "bg-[var(--btn-bg)] text-[var(--btn-text)] border border-[var(--btn-border)] font-medium hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-border-hover)]",
        // Ghost: Invisible until hover
        ghost: "bg-transparent border border-transparent text-muted-foreground hover:bg-[var(--muted-wash)] hover:text-foreground",
        // Link: No border, underline on hover
        link: "bg-transparent text-muted-foreground hover:text-foreground hover:underline underline-offset-4",
      },
      size: {
        // Institutional sizing: 6px radius, proportional padding
        default: "h-10 px-5 rounded-[6px] text-[14px]",
        sm: "h-9 px-4 rounded-[6px] text-[13px]",
        lg: "h-11 px-6 rounded-[6px] text-[15px]",
        icon: "h-10 w-10 rounded-[6px]",
        // Internal form button sizes
        "internal": "h-10 px-5 rounded-[6px] text-[14px] font-medium",
        "internal-sm": "h-9 px-4 rounded-[6px] text-[13px] font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
