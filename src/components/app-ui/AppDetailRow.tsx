import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP DETAIL ROW — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL DETAIL ROW COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * For displaying label/value pairs with optional icon and action.
 * Common use cases:
 * - Profile pages (email, phone, etc.)
 * - Settings displays
 * - Record details
 * 
 * USAGE:
 *   <AppDetailRow
 *     icon={<Mail className="h-4 w-4" />}
 *     label="Email"
 *     value="user@example.com"
 *     action={<AppButton size="xs" intent="ghost">Edit</AppButton>}
 *   />
 * 
 * ENFORCEMENT:
 * - All label/value displays must use this component
 * - No one-off detail row styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppDetailRowProps {
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Label text (e.g., "Email") */
  label: string;
  /** Value to display (can be text or custom element) */
  value: React.ReactNode;
  /** Optional helper description below value */
  description?: string;
  /** Optional action element (button, link, etc.) */
  action?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function AppDetailRow({
  icon,
  label,
  value,
  description,
  action,
  className,
}: AppDetailRowProps) {
  return (
    <div 
      className={cn(
        "py-3 flex items-start gap-3",
        className
      )}
    >
      {icon && (
        <div className="text-muted-foreground mt-0.5 shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-muted-foreground">
          {label}
        </div>
        <div className="text-[14px] font-medium text-foreground mt-0.5">
          {value}
        </div>
        {description && (
          <div className="text-[12px] text-muted-foreground mt-1">
            {description}
          </div>
        )}
      </div>
      {action && (
        <div className="shrink-0 self-center">
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * APP DETAIL ROW GROUP — Container for grouped detail rows
 * 
 * Adds dividers between rows automatically.
 */
interface AppDetailRowGroupProps {
  children: React.ReactNode;
  /** Whether to show dividers between rows */
  divided?: boolean;
  className?: string;
}

export function AppDetailRowGroup({
  children,
  divided = true,
  className,
}: AppDetailRowGroupProps) {
  return (
    <div 
      className={cn(
        divided && "divide-y divide-border/60",
        className
      )}
    >
      {children}
    </div>
  );
}
