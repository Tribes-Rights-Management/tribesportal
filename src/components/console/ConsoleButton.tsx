import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CONSOLE BUTTON — SYSTEM CONSOLE BUTTON (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * DO NOT STYLE BUTTONS PER-PAGE. USE VARIANTS HERE.
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This component matches AppButton exactly for visual consistency across
 * all workstations (Help, System Console, Licensing, etc.).
 * 
 * USAGE:
 * - All /admin/* pages MUST use ConsoleButton
 * - Do not create custom button styles in page files
 * 
 * DESIGN PHILOSOPHY:
 * - Institutional, not consumer
 * - Mercury-like neutral greys
 * - No blue fills (blue only for focus rings: #0071E3)
 * 
 * VARIANTS:
 * - Primary: Charcoal fill with white text
 * - Secondary: Light grey fill with subtle border
 * - Ghost: Transparent with hover wash
 * - Danger: Red border on transparent
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface ConsoleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button intent/style variant */
  intent?: "primary" | "secondary" | "ghost" | "danger";
  /** Button size */
  size?: "xs" | "sm" | "md" | "lg";
  /** Loading state - shows spinner and disables button */
  loading?: boolean;
  /** Text to show during loading state */
  loadingText?: string;
  /** Minimum width to prevent layout shift */
  minWidth?: string;
  /** Left icon */
  icon?: React.ReactNode;
  /** Right icon */
  iconRight?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

export const ConsoleButton = React.forwardRef<HTMLButtonElement, ConsoleButtonProps>(
  (
    {
      className,
      intent = "secondary",
      size = "md",
      loading = false,
      loadingText,
      minWidth,
      icon,
      iconRight,
      fullWidth = false,
      children,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Size-based classes - institutional padding and radius
    const sizeClasses = {
      xs: "h-[28px] px-3 text-[12px] gap-1 rounded-[6px]",
      sm: "h-[36px] px-4 text-[13px] gap-1.5 rounded-[6px]",
      md: "h-[44px] px-5 text-[14px] gap-2 rounded-[6px]",
      lg: "h-[52px] px-6 text-[15px] gap-2.5 rounded-[6px]",
    };

    // Icon utility classes - enforce consistent sizing and stroke width
    const iconUtilityClasses = size === "xs"
      ? "[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:[stroke-width:1.25] [&>span>svg]:h-3.5 [&>span>svg]:w-3.5 [&>span>svg]:[stroke-width:1.25]"
      : "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:1.25] [&>span>svg]:h-4 [&>span>svg]:w-4 [&>span>svg]:[stroke-width:1.25]";

    // Intent-based classes — Mercury/Stripe-like neutrals (NO BLUE FILLS)
    const getIntentClasses = () => {
      switch (intent) {
        case "primary":
          // Charcoal fill — the most prominent action (Stripe-like)
          return cn(
            "bg-[#1A1A1A] text-white border border-[#1A1A1A]",
            "font-medium tracking-[0.01em]",
            !isDisabled && "hover:bg-[#2D2D2D]",
            isDisabled && "bg-transparent text-muted-foreground border-border"
          );
        case "secondary":
          // Light grey fill with subtle border — most common action style (Mercury)
          return cn(
            "bg-[#F3F4F6] text-[#111827] border border-[#E6E8EC]",
            "font-medium",
            !isDisabled && "hover:bg-[#E5E7EB] hover:border-[#D1D5DB]",
            isDisabled && "text-muted-foreground/50 border-border/50 bg-muted/30"
          );
        case "ghost":
          // Invisible until hover — subtle neutral wash
          return cn(
            "bg-transparent text-muted-foreground border border-transparent",
            "font-normal",
            !isDisabled && "hover:bg-[#F3F4F6] hover:text-foreground",
            isDisabled && "text-muted-foreground/50"
          );
        case "danger":
          return cn(
            "bg-transparent text-destructive border border-destructive",
            "font-medium",
            !isDisabled && "hover:bg-destructive/10",
            isDisabled && "text-destructive/50 border-destructive/30"
          );
        default:
          return "";
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center transition-all duration-150",
          // Focus ring using brand blue
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "whitespace-nowrap select-none",
          // Icon normalization
          iconUtilityClasses,
          // Size
          sizeClasses[size],
          // Intent styling (includes hover)
          getIntentClasses(),
          // Disabled state
          isDisabled && "cursor-not-allowed opacity-40",
          // Full width
          fullWidth && "w-full",
          className
        )}
        style={{
          minWidth: minWidth || undefined,
          ...style,
        }}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {loadingText && <span>{loadingText}</span>}
            {!loadingText && children}
          </>
        ) : (
          <>
            {icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
            {children}
            {iconRight && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

ConsoleButton.displayName = "ConsoleButton";
