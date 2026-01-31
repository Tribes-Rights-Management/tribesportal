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
  "inline-flex items-center rounded px-1.5 py-0.5 text-2xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-muted/60 text-muted-foreground",
        secondary: "bg-muted/40 text-muted-foreground",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border border-border/60 text-muted-foreground bg-transparent",
        success: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
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
