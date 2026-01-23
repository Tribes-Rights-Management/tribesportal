import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP PAGE HEADER — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL PAGE HEADER COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Standardized page header with:
 * - Optional eyebrow label (e.g., "HELP WORKSTATION")
 * - Title (required)
 * - Optional description
 * - Optional action slot (buttons, etc.)
 * 
 * USAGE:
 *   <AppPageHeader
 *     eyebrow="SYSTEM CONSOLE"
 *     title="Governance Overview"
 *     description="Company-wide compliance and oversight"
 *     action={<AppButton>Add New</AppButton>}
 *   />
 * 
 * ENFORCEMENT:
 * - All pages must use this component for headers
 * - No one-off header styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppPageHeaderProps {
  /** Small uppercase label above title */
  eyebrow?: string;
  /** Main page title */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Optional action slot (buttons, etc.) */
  action?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function AppPageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: AppPageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-8", className)}>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-wider font-medium mb-2 text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[20px] font-semibold text-foreground leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[13px] text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
