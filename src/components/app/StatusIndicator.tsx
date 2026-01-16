import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL STATUS INDICATOR
 * 
 * Dashboard Rules:
 * - Show counts, states, alerts
 * - No charts for storytelling
 * - No friendly language
 * - Communicate operational state, not performance
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
 */
export function StatusIndicator({
  label,
  count,
  level = "neutral",
  className,
}: StatusIndicatorProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E8E8E8] rounded-md p-4",
        className
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B6B6B]">
        {label}
      </p>
      <p
        className={cn(
          "text-[28px] font-semibold mt-1 tracking-tight",
          level === "neutral" && "text-[#111]",
          level === "warning" && "text-[#B45309]",
          level === "alert" && "text-[#DC2626]",
          level === "info" && "text-[#0369A1]"
        )}
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
        level === "neutral" && "text-[#6B6B6B]",
        level === "warning" && "text-[#B45309]",
        level === "alert" && "text-[#DC2626]",
        level === "info" && "text-[#0369A1]",
        className
      )}
    >
      {message}
    </div>
  );
}
