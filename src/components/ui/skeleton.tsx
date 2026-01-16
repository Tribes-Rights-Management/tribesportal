import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL SKELETON — ACQUISITION-GRADE
 * 
 * PHASE 5 VISUAL RESTRAINT:
 * - No animate-pulse (implies urgency)
 * - Static placeholder with muted background
 * - Predictable, not fast
 * - System feels reliable, not reactive
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "rounded bg-[#F0F0F0]", // Static, no animation
        className
      )} 
      {...props} 
    />
  );
}

export { Skeleton };
