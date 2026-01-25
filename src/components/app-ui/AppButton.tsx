import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * APP BUTTON — INSTITUTIONAL BUTTON SYSTEM (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * INSTITUTIONAL STYLING — BORDER-BASED, MONOCHROMATIC, SOPHISTICATED
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN PHILOSOPHY:
 * - Institutional, not consumer
 * - Understated, not attention-seeking
 * - Monochromatic, not colorful
 * - Sparse, not dense
 * - Think: Financial terminal, not SaaS dashboard
 * 
 * VARIANTS:
 * - Primary: White border, transparent bg - main actions
 * - Secondary: Gray border, transparent bg - less important
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
      xs: "h-[28px] px-3 text-[12px] gap-1 rounded-[var(--control-radius-sm)]",
      sm: "h-[36px] px-4 text-[13px] gap-1.5 rounded-[var(--control-radius)]",
      md: "h-[44px] px-5 text-[14px] gap-2 rounded-[var(--control-radius)]",
      lg: "h-[52px] px-6 text-[15px] gap-2.5 rounded-[var(--control-radius)]",
    };

    // Icon utility classes - enforce consistent sizing and stroke width
    // xs buttons use 14px icons, all others use 16px icons
    const iconUtilityClasses = size === "xs"
      ? "[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:[stroke-width:1.25] [&>span>svg]:h-3.5 [&>span>svg]:w-3.5 [&>span>svg]:[stroke-width:1.25]"
      : "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:1.25] [&>span>svg]:h-4 [&>span>svg]:w-4 [&>span>svg]:[stroke-width:1.25]";

    // Intent-based classes using Tailwind for proper theme adaptation
    const getIntentClasses = () => {
      switch (intent) {
        case "primary":
          return cn(
            // Deep neutral fill - less harsh than pure black
            "bg-foreground/90 text-background border border-foreground/20",
            "font-medium tracking-[0.01em]",
            !isDisabled && "hover:bg-foreground/80",
            isDisabled && "bg-transparent text-muted-foreground border-border"
          );
        case "secondary":
          return cn(
            // Outline style - the default recommended action look
            "bg-transparent text-foreground border border-border",
            "font-normal",
            !isDisabled && "hover:bg-muted/50 hover:border-muted-foreground/50",
            isDisabled && "text-muted-foreground/50 border-border/50"
          );
        case "tertiary":
          return cn(
            "bg-transparent text-muted-foreground border-0",
            "font-normal",
            !isDisabled && "hover:text-foreground hover:underline hover:underline-offset-4",
            isDisabled && "text-muted-foreground/50"
          );
        case "ghost":
          return cn(
            "bg-transparent text-muted-foreground border border-transparent",
            "font-normal",
            !isDisabled && "hover:bg-muted/50 hover:text-foreground",
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
