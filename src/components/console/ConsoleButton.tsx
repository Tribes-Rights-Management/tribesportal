import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CONSOLE BUTTON — SYSTEM CONSOLE COMPONENT KIT
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * INSTITUTIONAL STYLING RULES (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - Height: 44px (md) / 36px (sm) / 28px (xs)
 * - Radius: 12px (not rounded-full, not pill)
 * - Primary: Dark elevated surface, NOT white
 * - No opacity-based disabled states on entire element
 * - Stable width during loading states
 * 
 * USAGE:
 * - Import from @/components/console instead of @/components/ui
 * - All /admin routes must use this component
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

    // Size-based classes
    const sizeClasses = {
      xs: "h-[var(--console-control-height-xs)] px-2.5 text-[11px] gap-1",
      sm: "h-[var(--console-control-height-sm)] px-3.5 text-[13px] gap-1.5",
      md: "h-[var(--console-control-height)] px-5 text-[14px] gap-2",
    };

    // Intent-based inline styles (using CSS variables from .console-scope)
    const intentStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: isDisabled
          ? "var(--console-primary-bg-disabled)"
          : "var(--console-primary-bg)",
        color: isDisabled
          ? "var(--console-primary-fg-disabled)"
          : "var(--console-primary-fg)",
        border: `1px solid ${isDisabled ? "var(--console-primary-border)" : "var(--console-primary-border)"}`,
      },
      secondary: {
        backgroundColor: "var(--console-secondary-bg)",
        color: isDisabled
          ? "var(--console-fg-muted)"
          : "var(--console-secondary-fg)",
        border: "1px solid var(--console-secondary-border)",
      },
      ghost: {
        backgroundColor: "transparent",
        color: isDisabled
          ? "var(--console-fg-muted)"
          : "var(--console-secondary-fg)",
        border: "1px solid transparent",
      },
      danger: {
        backgroundColor: "var(--console-danger-bg)",
        color: isDisabled
          ? "var(--console-fg-muted)"
          : "var(--console-danger-fg)",
        border: "1px solid var(--console-danger-border)",
      },
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-white/20 focus-visible:ring-offset-[var(--console-bg)]",
          "rounded-[var(--console-control-radius)]",
          "whitespace-nowrap select-none",
          // Size
          sizeClasses[size],
          // Disabled state
          isDisabled && "cursor-not-allowed",
          // Hover (only for non-disabled)
          !isDisabled && intent === "primary" && "hover:bg-[var(--console-primary-bg-hover)]",
          !isDisabled && intent === "secondary" && "hover:bg-[var(--console-secondary-bg-hover)]",
          !isDisabled && intent === "ghost" && "hover:bg-[var(--console-secondary-bg-hover)]",
          !isDisabled && intent === "danger" && "hover:bg-[var(--console-danger-bg-hover)]",
          className
        )}
        style={{
          ...intentStyles[intent],
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
