import { Loader2, Check, X, AlertTriangle } from "lucide-react";

export type StatusChipStatus = "pending" | "running" | "pass" | "fail" | "warning";

interface StatusChipProps {
  status: StatusChipStatus;
  className?: string;
}

/**
 * StatusChip - Institutional status indicator (non-interactive)
 * 
 * DESIGN STANDARD:
 * - Height: 28px
 * - Min-width: 96px for alignment
 * - Non-interactive: no hover, no pointer cursor
 * - Restrained colors: subtle tinted backgrounds + clear text
 * - Icons: 12px, left-aligned inside chip
 */
export function StatusChip({ status, className = "" }: StatusChipProps) {
  const config: Record<StatusChipStatus, { 
    bg: string; 
    border: string; 
    text: string; 
    label: string;
    icon: React.ReactNode;
    ariaLabel: string;
  }> = {
    pending: {
      bg: "rgba(255,255,255,0.04)",
      border: "rgba(255,255,255,0.08)",
      text: "rgba(255,255,255,0.5)",
      label: "Pending",
      icon: <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />,
      ariaLabel: "Status: Pending - check has not run yet",
    },
    running: {
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.18)",
      text: "#60a5fa",
      label: "Running",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      ariaLabel: "Status: Running - check in progress",
    },
    pass: {
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.15)",
      text: "#4ade80",
      label: "Pass",
      icon: <Check className="h-3 w-3" />,
      ariaLabel: "Status: Pass - check succeeded",
    },
    warning: {
      bg: "rgba(234,179,8,0.08)",
      border: "rgba(234,179,8,0.15)",
      text: "#facc15",
      label: "Warn",
      icon: <AlertTriangle className="h-3 w-3" />,
      ariaLabel: "Status: Warning - check completed with warnings",
    },
    fail: {
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.15)",
      text: "#f87171",
      label: "Fail",
      icon: <X className="h-3 w-3" />,
      ariaLabel: "Status: Fail - check failed",
    },
  };

  const c = config[status];

  return (
    <span
      role="status"
      aria-label={c.ariaLabel}
      className={`
        inline-flex items-center justify-center gap-1.5
        h-7 min-w-[96px] px-3
        text-[11px] font-medium tracking-wide
        rounded-full
        select-none
        ${className}
      `}
      style={{
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
      }}
    >
      {c.icon}
      {c.label}
    </span>
  );
}
