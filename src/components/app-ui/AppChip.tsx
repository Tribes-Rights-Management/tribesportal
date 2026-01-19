import * as React from "react";
import { Loader2, Check, X, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * APP CHIP — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * NON-INTERACTIVE STATUS INDICATOR (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - NOT a button — renders as span/div
 * - No hover/active states, no pointer cursor
 * - Height: 28px, radius: pill (9999px)
 * - Restrained fills, clear text
 * - Fixed minimum width for alignment
 * 
 * ENFORCEMENT:
 * - Import from @/components/app-ui
 * - For status indicators, audit rows, etc.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type ChipStatus = "pending" | "running" | "pass" | "warning" | "fail";
export type ChipSeverity = "high" | "medium" | "low";
export type ChipVariant = "default" | "outline" | "subtle";

interface AppChipProps {
  /** Status variant for security/audit checks */
  status?: ChipStatus;
  /** Severity variant for exceptions */
  severity?: ChipSeverity;
  /** Visual variant */
  variant?: ChipVariant;
  /** Optional custom label (overrides default status/severity label) */
  label?: string;
  /** Show icon */
  showIcon?: boolean;
  /** Additional class names */
  className?: string;
}

// Status configuration
const statusConfig: Record<
  ChipStatus,
  { label: string; icon: React.ReactNode; cssVar: string }
> = {
  pending: {
    label: "Pending",
    icon: <Circle className="h-3 w-3" />,
    cssVar: "pending",
  },
  running: {
    label: "Running",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    cssVar: "running",
  },
  pass: {
    label: "Pass",
    icon: <Check className="h-3 w-3" />,
    cssVar: "pass",
  },
  warning: {
    label: "Warning",
    icon: <AlertTriangle className="h-3 w-3" />,
    cssVar: "warning",
  },
  fail: {
    label: "Fail",
    icon: <X className="h-3 w-3" />,
    cssVar: "fail",
  },
};

// Severity configuration
const severityConfig: Record<ChipSeverity, { label: string; cssVar: string }> = {
  high: { label: "High", cssVar: "fail" },
  medium: { label: "Medium", cssVar: "warning" },
  low: { label: "Low", cssVar: "running" },
};

export function AppChip({
  status,
  severity,
  variant = "default",
  label,
  showIcon = true,
  className,
}: AppChipProps) {
  // Status chip
  if (status) {
    const config = statusConfig[status];
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center gap-1.5",
          "h-7 min-w-[96px] px-3",
          "text-[12px] font-medium rounded-full",
          "select-none pointer-events-none",
          className
        )}
        style={{
          backgroundColor: `hsl(var(--app-chip-${config.cssVar}-bg))`,
          border: `1px solid hsl(var(--app-chip-${config.cssVar}-border))`,
          color: `hsl(var(--app-chip-${config.cssVar}-fg))`,
        }}
        role="status"
        aria-label={`Status: ${label || config.label}`}
      >
        {showIcon && config.icon}
        <span>{label || config.label}</span>
      </span>
    );
  }

  // Severity chip
  if (severity) {
    const config = severityConfig[severity];
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          "h-5 px-1.5",
          "text-[10px] font-medium uppercase tracking-wide rounded",
          "select-none pointer-events-none",
          className
        )}
        style={{
          backgroundColor: `hsl(var(--app-chip-${config.cssVar}-bg))`,
          border: `1px solid hsl(var(--app-chip-${config.cssVar}-border))`,
          color: `hsl(var(--app-chip-${config.cssVar}-fg))`,
        }}
        role="status"
        aria-label={`Severity: ${label || config.label}`}
      >
        {label || config.label}
      </span>
    );
  }

  // Fallback: neutral chip
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "h-5 px-1.5",
        "text-[10px] font-medium uppercase tracking-wide rounded",
        "select-none pointer-events-none",
        className
      )}
      style={{
        backgroundColor: "hsl(var(--app-chip-pending-bg))",
        border: "1px solid hsl(var(--app-chip-pending-border))",
        color: "hsl(var(--app-chip-pending-fg))",
      }}
    >
      {label || "—"}
    </span>
  );
}
