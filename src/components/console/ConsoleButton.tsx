import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CONSOLE BUTTON — SYSTEM CONSOLE INSTITUTIONAL BUTTON
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * INSTITUTIONAL STYLING — BORDER-BASED, MONOCHROMATIC, SOPHISTICATED
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Extends the App UI Kit institutional button standards for System Console.
 * Uses border-focused design: transparent backgrounds with visible borders.
 * 
 * DESIGN PHILOSOPHY:
 * - Institutional, not consumer
 * - Understated, not attention-seeking
 * - Monochromatic, not colorful
 * - Think: Financial terminal, not SaaS dashboard
 * 
 * USAGE:
 * - Import from @/components/console for /admin routes
 * - Import from @/components/app-ui for all other routes
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface ConsoleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button intent/style variant */
  intent?: "primary" | "secondary" | "ghost" | "danger";
  /** Button size */
  size?: "xs" | "sm" | "md";
  /** Loading state - shows spinner and disables button */
  loading?: boolean;
  /** Text to show during loading state */
  loadingText?: string;
  /** Minimum width to prevent layout shift */
  minWidth?: string;
  /** Left icon */
  icon?: React.ReactNode;
}

export const ConsoleButton = React.forwardRef<HTMLButtonElement, ConsoleButtonProps>(
  (
    {
      className,
      intent = "primary",
      size = "md",
      loading = false,
      loadingText = "Processing…",
      minWidth,
      icon,
      children,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Size-based classes - institutional padding
    const sizeClasses = {
      xs: "h-[28px] px-3 text-[12px] gap-1",
      sm: "h-[36px] px-4 text-[13px] gap-1.5",
      md: "h-[44px] px-5 text-[14px] gap-2",
    };

    // Intent-based inline styles - border-focused institutional design
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

    // Hover classes - subtle effects
    const getHoverClass = () => {
      if (isDisabled) return "";
      switch (intent) {
        case "primary":
          return "hover:bg-white/[0.08] active:bg-white/[0.12]";
        case "secondary":
          return "hover:border-[#505050] hover:text-white";
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
          "focus-visible:ring-white/20 focus-visible:ring-offset-[var(--console-bg)]",
          "rounded-[var(--control-radius)]",
          "whitespace-nowrap select-none",
          // Size
          sizeClasses[size],
          // Hover
          getHoverClass(),
          // Disabled state
          isDisabled && "cursor-not-allowed opacity-40",
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
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            {icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

ConsoleButton.displayName = "ConsoleButton";
