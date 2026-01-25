import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL STATUS INDICATOR — DARK THEME
 * 
 * Dashboard Rules:
 * - Show counts, states, alerts
 * - No charts for storytelling
 * - No friendly language
 * - Communicate operational state, not performance
 * - Uses platform dark-theme tokens
 */

export type StatusLevel = "neutral" | "warning" | "alert" | "info";

interface StatusIndicatorProps {
  label: string;
  count: number;
  level?: StatusLevel;
  className?: string;
}

/**
 * Status indicator for dashboard counts
 * 
 * Design:
 * - Dense, data-first
 * - Minimal visual treatment
 * - Color only for alerts/warnings
 * - Dark theme using platform tokens
 */
export function StatusIndicator({
  label,
  count,
  level = "neutral",
  className,
}: StatusIndicatorProps) {
  return (
    <div
      className={cn("rounded p-4", className)}
      style={{ 
        backgroundColor: 'var(--platform-surface)',
        border: '1px solid var(--platform-border)'
      }}
    >
      <p 
        className="text-[11px] font-medium uppercase tracking-[0.04em]"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-[28px] font-semibold mt-1 tracking-tight",
          level === "neutral" && "text-[var(--platform-text)]",
          level === "warning" && "text-[var(--warning-text)]",
          level === "alert" && "text-[var(--error-text)]",
          level === "info" && "text-[var(--info-text)]"
        )}
        style={level === "neutral" ? { color: 'var(--platform-text)' } : undefined}
      >
        {count}
      </p>
    </div>
  );
}

/**
 * Alert status row for dashboard
 * 
 * Design:
 * - Flat, text-only
 * - No icons unless critical
 * - Declarative language
 * - Dark theme using platform tokens
 */
interface StatusAlertProps {
  message: string;
  level?: StatusLevel;
  className?: string;
}

export function StatusAlert({
  message,
  level = "neutral",
  className,
}: StatusAlertProps) {
  return (
    <div
      className={cn(
        "py-2 px-3 text-[13px]",
        level === "neutral" && "text-[var(--platform-text-secondary)]",
        level === "warning" && "text-[var(--warning-text)]",
        level === "alert" && "text-[var(--error-text)]",
        level === "info" && "text-[var(--info-text)]",
        className
      )}
      style={level === "neutral" ? { color: 'var(--platform-text-secondary)' } : undefined}
    >
      {message}
    </div>
  );
}
