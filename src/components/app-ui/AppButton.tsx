import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * APP BUTTON — INSTITUTIONAL BUTTON SYSTEM (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * DO NOT STYLE BUTTONS PER-PAGE. USE VARIANTS HERE.
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * MERCURY/STRIPE-LIKE NEUTRAL BUTTON SYSTEM:
 * - NO BLACK BUTTONS — all primary buttons use neutral grey
 * - NO BLUE FILLS — blue (#0071E3) only for focus rings
 * 
 * DESIGN PHILOSOPHY:
 * - Institutional, not consumer
 * - Understated, not attention-seeking
 * - Monochromatic neutral greys
 * - Think: Stripe Dashboard, Mercury.com
 * 
 * VARIANTS:
 * - Primary: Light grey fill with subtle border — main actions
 * - Secondary: Same as primary (unified look)
 * - Tertiary: No border, text only with underline on hover
 * - Ghost: Invisible until hover
 * - Danger: Red border, transparent bg
 * 
 * ENFORCEMENT:
 * - All pages must import AppButton from @/components/app-ui
 * - Do NOT import Button from @/components/ui/button directly
 * ═══════════════════════════════════════════════════════════════════════════
 */

type ButtonIntent = "primary" | "secondary" | "tertiary" | "ghost" | "danger" | "destructive";

export interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button intent/style variant */
  intent?: ButtonIntent;
  /** Alias for intent (for compatibility) */
  variant?: ButtonIntent;
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

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      className,
      intent: intentProp,
      variant,
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
    // Support both intent and variant props, normalize destructive to danger
    const rawIntent = intentProp || variant || "primary";
    const intent = rawIntent === "destructive" ? "danger" : rawIntent;
    const isDisabled = disabled || loading;

    // Size-based classes - institutional padding and radius
    const sizeClasses = {
      xs: "h-[28px] px-3 text-[12px] gap-1 rounded-[6px]",
      sm: "h-[36px] px-4 text-[13px] gap-1.5 rounded-[6px]",
      md: "h-[40px] px-5 text-[14px] gap-2 rounded-[6px]",
      lg: "h-[44px] px-6 text-[15px] gap-2.5 rounded-[6px]",
    };

    // Icon utility classes - enforce consistent sizing and stroke width
    // xs buttons use 14px icons, all others use 16px icons
    const iconUtilityClasses = size === "xs"
      ? "[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:[stroke-width:1.25] [&>span>svg]:h-3.5 [&>span>svg]:w-3.5 [&>span>svg]:[stroke-width:1.25]"
      : "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:1.25] [&>span>svg]:h-4 [&>span>svg]:w-4 [&>span>svg]:[stroke-width:1.25]";

    // Intent-based classes — Mercury/Stripe-like neutrals (NO BLACK, NO BLUE FILLS)
    const getIntentClasses = () => {
      switch (intent) {
        case "primary":
          // Light grey fill with subtle border — Mercury/Stripe neutral (NO BLACK)
          return cn(
            "bg-[var(--btn-bg)] text-[var(--btn-text)] border border-[var(--btn-border)]",
            "font-medium",
            !isDisabled && "hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-border-hover)]",
            isDisabled && "text-muted-foreground/50 border-border/50 bg-muted/30"
          );
        case "secondary":
          // Same as primary for unified Mercury-like look
          return cn(
            "bg-[var(--btn-bg)] text-[var(--btn-text)] border border-[var(--btn-border)]",
            "font-medium",
            !isDisabled && "hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-border-hover)]",
            isDisabled && "text-muted-foreground/50 border-border/50 bg-muted/30"
          );
        case "tertiary":
          return cn(
            "bg-transparent text-muted-foreground border-0",
            "font-normal",
            !isDisabled && "hover:text-foreground hover:underline hover:underline-offset-4",
            isDisabled && "text-muted-foreground/50"
          );
        case "ghost":
          // Invisible until hover — subtle neutral wash
          return cn(
            "bg-transparent text-muted-foreground border border-transparent",
            "font-normal",
            !isDisabled && "hover:bg-[var(--muted-wash)] hover:text-foreground",
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
          // Icon normalization - enforce consistent sizing and stroke
          iconUtilityClasses,
          // Size
          intent !== "tertiary" && sizeClasses[size],
          // Tertiary has minimal padding
          intent === "tertiary" && "px-0 py-1 text-[14px]",
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

AppButton.displayName = "AppButton";
