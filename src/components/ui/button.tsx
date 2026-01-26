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
 * - NO BLACK BUTTONS — all primary buttons use neutral grey fill
 * - NO BLUE FILLS — blue (#0071E3) only for focus rings
 * - NO heavy borders — Mercury-like transparent or subtle
 * 
 * VARIANTS:
 * - default: Light grey fill (primary action) — visible on all surfaces
 * - secondary: Outline with subtle border (secondary action)
 * - outline: Same as secondary
 * - ghost: Transparent until hover
 * - destructive: Red border on transparent
 * - link: Text only with underline on hover
 * 
 * Focus ring: #0071E3 (brand blue) ONLY — no blue fills anywhere
 * ═══════════════════════════════════════════════════════════════════════════
 */

const buttonVariants = cva(
  // Base: Institutional button system - Mercury/Stripe neutrals, no blue fills, NO BLACK
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-medium",
  {
    variants: {
      variant: {
        // Default (primary): Mercury-like light grey fill — visible on all surfaces
        default: "bg-[var(--btn-bg)] text-[var(--btn-text)] hover:bg-[var(--btn-bg-hover)] active:bg-[var(--btn-bg-active)]",
        // Secondary: Outline style with subtle border
        secondary: "bg-transparent text-[var(--btn-text)] border border-[var(--btn-outline-border)] hover:bg-[var(--btn-outline-hover-bg)]",
        // Outline: Same as secondary
        outline: "bg-transparent text-[var(--btn-text)] border border-[var(--btn-outline-border)] hover:bg-[var(--btn-outline-hover-bg)]",
        // Ghost: Invisible until hover
        ghost: "bg-transparent text-muted-foreground hover:bg-[var(--muted-wash)] hover:text-foreground",
        // Destructive: Red border on transparent
        destructive: "bg-transparent border border-destructive text-destructive hover:bg-destructive/10",
        // Link: No border, underline on hover
        link: "bg-transparent text-muted-foreground hover:text-foreground hover:underline underline-offset-4",
      },
      size: {
        // Institutional sizing: 6px radius, proportional padding
        default: "h-10 px-5 rounded-[6px] text-[14px]",
        sm: "h-9 px-4 rounded-[6px] text-[13px]",
        lg: "h-11 px-6 rounded-[6px] text-[15px]",
        xs: "h-8 px-3 rounded-[6px] text-[12px]",
        icon: "h-10 w-10 rounded-[6px]",
        "icon-sm": "h-8 w-8 rounded-[6px]",
        // Internal form button sizes
        "internal": "h-10 px-5 rounded-[6px] text-[14px]",
        "internal-sm": "h-9 px-4 rounded-[6px] text-[13px]",
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
