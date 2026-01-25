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
 * VARIANTS:
 * - default: Charcoal fill (primary actions)
 * - secondary: Light grey fill (secondary actions)
 * - outline: Same as secondary for consistency
 * - ghost: Transparent until hover
 * - destructive: Red border on transparent
 * - link: Text only with underline on hover
 * 
 * Focus ring: #0071E3 (brand blue) ONLY — no blue fills anywhere
 * ═══════════════════════════════════════════════════════════════════════════
 */

const buttonVariants = cva(
  // Base: Institutional button system - Mercury/Stripe neutrals, no blue fills
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Charcoal fill — main actions (Stripe-like)
        default: "bg-[#1A1A1A] text-white border border-[#1A1A1A] font-medium tracking-[0.01em] hover:bg-[#2D2D2D]",
        // Destructive: Red border on transparent
        destructive: "bg-transparent border border-destructive text-destructive font-medium hover:bg-destructive/10",
        // Outline: Light grey fill with border — secondary actions (Mercury-like)
        outline: "bg-[#F3F4F6] text-[#111827] border border-[#E6E8EC] font-medium hover:bg-[#E5E7EB] hover:border-[#D1D5DB]",
        // Secondary: Same as outline for consistency
        secondary: "bg-[#F3F4F6] text-[#111827] border border-[#E6E8EC] font-medium hover:bg-[#E5E7EB] hover:border-[#D1D5DB]",
        // Ghost: Invisible until hover
        ghost: "bg-transparent border border-transparent text-muted-foreground hover:bg-[#F3F4F6] hover:text-foreground",
        // Link: No border, underline on hover
        link: "bg-transparent text-muted-foreground hover:text-foreground hover:underline underline-offset-4",
      },
      size: {
        // Institutional sizing: 6px radius, proportional padding
        default: "h-11 px-5 rounded-[6px] text-[14px]",
        sm: "h-9 px-4 rounded-[6px] text-[13px]",
        lg: "h-[52px] px-6 rounded-[6px] text-[15px]",
        icon: "h-11 w-11 rounded-[6px]",
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
