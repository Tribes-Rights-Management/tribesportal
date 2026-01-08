import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base: institutional-grade button system (LOCKED)
  // No bounce, spring, or decorative animation. Opacity transitions only.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[15px] font-medium transition-opacity duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:ring-offset-1 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary submit: solid black, white text, subtle radius (LOCKED)
        default: "bg-foreground text-white hover:opacity-90 disabled:bg-[#a3a3a3] disabled:opacity-100",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        outline: "border border-[#d4d4d4] bg-white text-foreground hover:bg-[#fafafa]",
        secondary: "bg-[#f5f5f5] text-foreground hover:bg-[#e5e5e5]",
        ghost: "hover:bg-[#f5f5f5] text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-md px-4 text-sm",
        lg: "h-14 rounded-md px-8",
        icon: "h-10 w-10",
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
