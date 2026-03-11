import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppButton } from "./AppButton";

/**
 * APP SECTION HEADER — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * STANDARD PAGE HEADER PATTERN (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - Title + optional subtitle
 * - Back navigation (optional)
 * - Actions slot (AppButton)
 * - Meta slot (timestamps, status)
 * 
 * ENFORCEMENT:
 * - Import from @/components/app-ui
 * - Use for all page-level headers across the application
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppSectionHeaderProps {
  /** Main title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Back navigation route */
  backTo?: string;
  /** Back button label */
  backLabel?: string;
  /** Actions slot (typically AppButton components) */
  actions?: React.ReactNode;
  /** Meta information slot (timestamps, status badges) */
  meta?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function AppSectionHeader({
  title,
  subtitle,
  backTo,
  backLabel,
  actions,
  meta,
  className,
}: AppSectionHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Back navigation */}
      {backTo && (
        <AppButton
          intent="ghost"
          size="sm"
          onClick={() => navigate(backTo)}
          icon={<ChevronLeft className="h-4 w-4" />}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          {backLabel || "Back"}
        </AppButton>
      )}

      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Title block */}
        <div className="space-y-0.5 min-w-0">
          <h1 className="text-lg font-medium text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>

      {/* Meta row */}
      {meta && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {meta}
        </div>
      )}
    </div>
  );
}
