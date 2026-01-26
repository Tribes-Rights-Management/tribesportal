import { forwardRef, ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * HEADER ICON BUTTON — STRIPE-LIKE ICON CONTROLS (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Standardized icon button for the global header.
 * 
 * Specs:
 * - Icon size: 18px (h-[18px] w-[18px])
 * - Button hit area: 36px (h-9 w-9)
 * - Stroke weight: 1.5
 * - Color: muted foreground, darker on hover
 * - Subtle background on hover (Stripe-like)
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface HeaderIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  "aria-label": string;
  /** Optional badge count for notifications */
  badgeCount?: number;
}

export const HeaderIconButton = forwardRef<HTMLButtonElement, HeaderIconButtonProps>(
  ({ icon: Icon, className, badgeCount, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Size and shape
          "relative inline-flex items-center justify-center",
          "h-9 w-9 rounded-lg shrink-0",
          // Colors
          "text-muted-foreground hover:text-foreground",
          "hover:bg-muted/60 active:bg-muted",
          // Transitions
          "transition-colors duration-150",
          // Focus ring
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        {...props}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        
        {/* Optional badge */}
        {typeof badgeCount === "number" && badgeCount > 0 && (
          <span 
            className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] font-medium px-0.5 bg-foreground text-background"
          >
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </button>
    );
  }
);

HeaderIconButton.displayName = "HeaderIconButton";
