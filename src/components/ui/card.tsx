import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL CARD SYSTEM — ACQUISITION-GRADE
 * 
 * PHASE 5 VISUAL RESTRAINT:
 * - Flat surfaces, minimal elevation
 * - No excessive rounding (8px max)
 * - Muted borders, no heavy shadows
 * - Typography-led hierarchy
 * - If an element draws attention to itself, reduce it
 */

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "rounded-lg", // Uses token-based styling
        className
      )}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-subtle)',
        ...style
      }}
      {...props} 
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1 p-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 
      ref={ref} 
      className={cn(
        "text-[15px] font-medium leading-none tracking-tight text-foreground", // Restrained, not oversized
        className
      )} 
      {...props} 
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p 
      ref={ref} 
      className={cn(
        "text-[13px] text-muted-foreground", // Muted, functional
        className
      )} 
      {...props} 
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

