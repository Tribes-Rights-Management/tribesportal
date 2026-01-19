import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsoleButton } from "./ConsoleButton";

/**
 * CONSOLE SECTION HEADER — SYSTEM CONSOLE COMPONENT KIT
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * STANDARD PAGE HEADER FOR CONSOLE ROUTES (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * FEATURES:
 * - Optional back button with navigate(-1) + fallback logic
 * - Title + subtitle area
 * - Actions slot (right-aligned, for ConsoleButtons)
 * - Meta slot (e.g., "Last run: 5 minutes ago")
 * 
 * USAGE:
 * <ConsoleSectionHeader
 *   title="Security Verification"
 *   subtitle="Live security posture checks"
 *   showBack
 *   backFallback="/admin"
 *   actions={<ConsoleButton>Run checks</ConsoleButton>}
 *   meta="Last run: 5 minutes ago"
 * />
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ConsoleSectionHeaderProps {
  /** Page/section title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Show back/exit button */
  showBack?: boolean;
  /** Fallback route if history is empty */
  backFallback?: string;
  /** Custom back click handler (overrides default navigation) */
  onBack?: () => void;
  /** Right-side actions (buttons) */
  actions?: React.ReactNode;
  /** Meta information (e.g., last run timestamp) */
  meta?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function ConsoleSectionHeader({
  title,
  subtitle,
  showBack = false,
  backFallback = "/admin",
  onBack,
  actions,
  meta,
  className,
}: ConsoleSectionHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(backFallback);
    }
  };

  return (
    <header className={cn("space-y-4", className)}>
      {/* Top row: Back button + Title + Actions */}
      <div className="flex items-start gap-3">
        {/* Back button */}
        {showBack && (
          <ConsoleButton
            intent="ghost"
            size="sm"
            onClick={handleBack}
            aria-label="Go back"
            className="shrink-0 -ml-2 mt-0.5"
            icon={<ChevronLeft className="h-4 w-4" />}
          />
        )}

        {/* Title area */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-[20px] sm:text-[24px] font-medium tracking-[-0.01em] leading-tight"
            style={{ color: "var(--console-fg)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-[13px] mt-1 leading-snug"
              style={{ color: "var(--console-fg-muted)" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions (desktop) */}
        {actions && (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Meta row (optional) */}
      {meta && (
        <div
          className="text-[11px] uppercase tracking-wide"
          style={{ color: "var(--console-fg-muted)" }}
        >
          {meta}
        </div>
      )}

      {/* Actions (mobile - full width) */}
      {actions && (
        <div className="sm:hidden">
          {actions}
        </div>
      )}
    </header>
  );
}
