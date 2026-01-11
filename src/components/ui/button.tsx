import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base: marketing site alignment - institutional button system
  // Transition: 180-220ms with cubic-bezier(0.2, 0.8, 0.2, 1)
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[17px] font-semibold transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/12 focus-visible:ring-offset-2 disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: marketing site alignment - #0B0F14 bg, white text
        default: "bg-foreground text-white hover:opacity-90",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        outline: "border border-[rgba(0,0,0,0.10)] bg-white text-foreground hover:bg-[#fafafa]",
        secondary: "bg-[#f5f5f5] text-foreground hover:bg-[#ebebeb]",
        ghost: "hover:bg-[#f5f5f5] text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        // Marketing site alignment: 56px height, 16px radius
        default: "h-14 px-8 rounded-[16px]",
        sm: "h-12 px-6 rounded-[12px] text-base",
        lg: "h-16 px-10 rounded-[16px]",
        icon: "h-12 w-12 rounded-[12px]",
        // INTERNAL FORM BUTTON SIZES (for operational portal forms)
        "internal": "h-10 px-5 rounded-[10px] text-[15px] font-medium",
        "internal-sm": "h-9 px-4 rounded-[8px] text-[14px] font-medium",
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
