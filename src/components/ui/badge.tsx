import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL BADGE — ACQUISITION-GRADE
 * 
 * PHASE 5 VISUAL RESTRAINT:
 * - No colorful badges
 * - Muted, typography-led
 * - Restrained border radius (4px, not pill)
 * - Minimal visual weight
 */
const badgeVariants = cva(
  "inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-[#D4D4D4] bg-[#F5F5F5] text-[#111]",
        secondary: "border-[#E5E5E5] bg-[#FAFAFA] text-[#6B6B6B]",
        destructive: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
        outline: "border-[#E5E5E5] text-[#6B6B6B]",
        success: "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
