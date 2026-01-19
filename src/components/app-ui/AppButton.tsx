import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * APP BUTTON — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * INSTITUTIONAL STYLING RULES (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - Height: 44px (md) / 36px (sm) / 28px (xs) / 52px (lg)
 * - Radius: 12px (not rounded-full, not pill)
 * - Primary: Dark elevated surface, NOT white
 * - No opacity-based disabled states on entire element
 * - Stable width during loading states
 * 
 * ENFORCEMENT:
 * - All pages must import AppButton from @/components/app-ui
 * - Do NOT import Button from @/components/ui/button directly
 * - Do NOT use className overrides for bg/text/radius
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button intent/style variant */
  intent?: "primary" | "secondary" | "tertiary" | "ghost" | "danger";
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
      intent = "primary",
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

    // Size-based classes
    const sizeClasses = {
      xs: "h-[var(--control-height-xs)] px-2.5 text-[11px] gap-1 rounded-[var(--control-radius-sm)]",
      sm: "h-[var(--control-height-sm)] px-3.5 text-[13px] gap-1.5 rounded-[var(--control-radius-sm)]",
      md: "h-[var(--control-height-md)] px-5 text-[14px] gap-2 rounded-[var(--control-radius)]",
      lg: "h-[var(--control-height-lg)] px-6 text-[15px] gap-2.5 rounded-[var(--control-radius)]",
    };

    // Intent-based styles using CSS variables from :root
    const getIntentStyles = (): React.CSSProperties => {
      switch (intent) {
        case "primary":
          return {
            backgroundColor: isDisabled
              ? "hsl(var(--app-btn-primary-bg-disabled))"
              : "hsl(var(--app-btn-primary-bg))",
            color: isDisabled
              ? "hsl(var(--app-btn-primary-fg-disabled))"
              : "hsl(var(--app-btn-primary-fg))",
            border: `1px solid hsl(var(--app-btn-primary-border))`,
          };
        case "secondary":
        case "tertiary":
          return {
            backgroundColor: isDisabled
              ? "transparent"
              : "hsl(var(--app-btn-secondary-bg))",
            color: isDisabled
              ? "hsl(var(--muted-foreground))"
              : "hsl(var(--app-btn-secondary-fg))",
            border: `1px solid hsl(var(--app-btn-secondary-border))`,
          };
        case "ghost":
          return {
            backgroundColor: "transparent",
            color: isDisabled
              ? "hsl(var(--muted-foreground))"
              : "hsl(var(--app-btn-ghost-fg))",
            border: "1px solid transparent",
          };
        case "danger":
          return {
            backgroundColor: isDisabled
              ? "transparent"
              : "hsl(var(--app-btn-danger-bg))",
            color: isDisabled
              ? "hsl(var(--muted-foreground))"
              : "hsl(var(--app-btn-danger-fg))",
            border: `1px solid hsl(var(--app-btn-danger-border))`,
          };
        default:
          return {};
      }
    };

    // Hover class based on intent
    const getHoverClass = () => {
      if (isDisabled) return "";
      switch (intent) {
        case "primary":
          return "hover:bg-[hsl(var(--app-btn-primary-bg-hover))] hover:border-[hsl(var(--app-btn-primary-border-hover))]";
        case "secondary":
        case "tertiary":
          return "hover:bg-[hsl(var(--app-btn-secondary-bg-hover))]";
        case "ghost":
          return "hover:bg-[hsl(var(--app-btn-ghost-bg-hover))]";
        case "danger":
          return "hover:bg-[hsl(var(--app-btn-danger-bg-hover))]";
        default:
          return "";
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-white/20 focus-visible:ring-offset-background",
          "whitespace-nowrap select-none",
          // Size
          sizeClasses[size],
          // Hover
          getHoverClass(),
          // Disabled state
          isDisabled && "cursor-not-allowed",
          // Full width
          fullWidth && "w-full",
          className
        )}
        style={{
          ...getIntentStyles(),
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
