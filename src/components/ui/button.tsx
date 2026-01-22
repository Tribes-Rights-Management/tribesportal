import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base: Institutional button system - border-based, monochromatic
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: White border on transparent - main actions
        default: "bg-transparent border border-white text-white font-medium tracking-[0.01em] hover:bg-white/[0.08] active:bg-white/[0.12]",
        // Destructive: Red border on transparent
        destructive: "bg-transparent border border-[#DC2626] text-[#DC2626] font-medium hover:bg-[rgba(220,38,38,0.1)]",
        // Outline: Gray border, muted text - secondary actions
        outline: "bg-transparent border border-[#303030] text-[#AAAAAA] hover:border-[#505050] hover:text-white",
        // Ghost: Invisible until hover
        ghost: "bg-transparent border border-transparent text-[#AAAAAA] hover:bg-white/[0.04] hover:text-white",
        // Link: No border, underline on hover
        link: "bg-transparent text-[#AAAAAA] hover:text-white hover:underline underline-offset-4",
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
