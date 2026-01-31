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
  "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-muted/50 text-muted-foreground",
        secondary: "bg-muted/30 text-muted-foreground",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border border-border/50 text-muted-foreground bg-transparent",
        success: "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
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
