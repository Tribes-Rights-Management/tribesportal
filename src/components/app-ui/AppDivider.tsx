import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP DIVIDER — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL DIVIDER COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent section dividers with optional label.
 * 
 * USAGE:
 *   <AppDivider />
 *   <AppDivider label="Or continue with" />
 * 
 * ENFORCEMENT:
 * - All dividers must use this component
 * - No hardcoded hr or border styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppDividerProps {
  /** Optional label in the center */
  label?: string;
  /** Spacing variant */
  spacing?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

export function AppDivider({
  label,
  spacing = "md",
  className,
}: AppDividerProps) {
  const spacingClasses = {
    sm: "my-4",
    md: "my-6",
    lg: "my-8",
  };

  if (label) {
    return (
      <div className={cn("flex items-center gap-4", spacingClasses[spacing], className)}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return (
    <div
      className={cn("h-px bg-border", spacingClasses[spacing], className)}
      role="separator"
    />
  );
}
