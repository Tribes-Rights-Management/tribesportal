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

    // Intent-based styles - border-focused institutional design
    const getIntentStyles = (): React.CSSProperties => {
      const baseTransition = "all 150ms ease";
      
      switch (intent) {
        case "primary":
          return {
            backgroundColor: "transparent",
            color: isDisabled ? "rgba(255,255,255,0.4)" : "#FFFFFF",
            border: isDisabled ? "1px solid rgba(255,255,255,0.3)" : "1px solid #FFFFFF",
            fontWeight: 500,
            letterSpacing: "0.01em",
            transition: baseTransition,
          };
        case "secondary":
          return {
            backgroundColor: "transparent",
            color: isDisabled ? "rgba(170,170,170,0.5)" : "#AAAAAA",
            border: isDisabled ? "1px solid rgba(48,48,48,0.5)" : "1px solid #303030",
            fontWeight: 400,
            transition: baseTransition,
          };
        case "tertiary":
          return {
            backgroundColor: "transparent",
            color: isDisabled ? "rgba(170,170,170,0.5)" : "#AAAAAA",
            border: "none",
            fontWeight: 400,
            transition: baseTransition,
            padding: size === "xs" ? "0" : undefined,
          };
        case "ghost":
          return {
            backgroundColor: "transparent",
            color: isDisabled ? "rgba(170,170,170,0.5)" : "#AAAAAA",
            border: "1px solid transparent",
            fontWeight: 400,
            transition: baseTransition,
          };
        case "danger":
          return {
            backgroundColor: "transparent",
            color: isDisabled ? "rgba(220,38,38,0.5)" : "#DC2626",
            border: isDisabled ? "1px solid rgba(220,38,38,0.3)" : "1px solid #DC2626",
            fontWeight: 500,
            transition: baseTransition,
          };
        default:
          return {};
      }
    };

    // Hover classes - subtle background shifts
    const getHoverClass = () => {
      if (isDisabled) return "";
      switch (intent) {
        case "primary":
          return "hover:bg-white/[0.08] active:bg-white/[0.12]";
        case "secondary":
          return "hover:border-[#505050] hover:text-white";
        case "tertiary":
          return "hover:text-white hover:underline hover:underline-offset-4";
        case "ghost":
          return "hover:bg-white/[0.04] hover:text-white";
        case "danger":
          return "hover:bg-[rgba(220,38,38,0.1)]";
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-white/20 focus-visible:ring-offset-background",
          "whitespace-nowrap select-none",
          // Size
          intent !== "tertiary" && sizeClasses[size],
          // Tertiary has minimal padding
          intent === "tertiary" && "px-0 py-1 text-[14px]",
          // Hover
          getHoverClass(),
          // Disabled state
          isDisabled && "cursor-not-allowed opacity-40",
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
