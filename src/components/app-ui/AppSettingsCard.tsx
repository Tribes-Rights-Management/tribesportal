import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP SETTINGS CARD — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL SETTINGS SECTION CARD (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Container for settings/account pages with:
 * - Title header with optional description
 * - Consistent border/radius styling
 * - Built-in dividers between children
 * 
 * USAGE:
 *   <AppSettingsCard
 *     title="Account Identity"
 *     description="Managed by workspace policy"
 *   >
 *     <AppDetailRow label="Email" value="..." variant="copyable" />
 *     <AppDetailRow label="Role" value="..." variant="readonly" />
 *   </AppSettingsCard>
 * 
 * ENFORCEMENT:
 * - All settings sections must use this component
 * - No one-off card styling for settings
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppSettingsCardProps {
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Card content (typically AppDetailRow components) */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function AppSettingsCard({
  title,
  description,
  children,
  className,
}: AppSettingsCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden w-full max-w-full",
        "bg-card border border-border/60",
        className
      )}
    >
      {/* Header — matches AppListCard styling */}
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </h2>
          {description && (
            <p className="text-xs mt-1 text-muted-foreground/70">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content with subtle auto-dividers */}
      <div className="w-full max-w-full min-w-0 divide-y divide-border/40">
        {children}
      </div>
    </div>
  );
}

/**
 * APP SETTINGS FOOTER — Policy/governance notice at bottom of settings pages
 */
interface AppSettingsFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function AppSettingsFooter({ children, className }: AppSettingsFooterProps) {
  return (
    <p className={cn("mt-4 md:mt-6 text-[12px] md:text-[13px] text-muted-foreground", className)}>
      {children}
    </p>
  );
}
