import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/ui/copy-button";
import { Switch } from "@/components/ui/switch";

/**
 * APP DETAIL ROW — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL DETAIL ROW COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * For displaying label/value pairs with optional icon and action.
 * Supports multiple variants for different interaction patterns.
 * 
 * VARIANTS:
 * - readonly: label + single-line value + optional helper text
 * - editable: label + value + CTA like "Edit" / "Change"
 * - select: label + current selection + chevron (opens picker/modal)
 * - copyable: label + single-line value + copy icon
 * - toggle: label + description + iOS-style switch
 * 
 * USAGE:
 *   <AppDetailRow
 *     icon={Mail}
 *     label="Email"
 *     value="user@example.com"
 *     variant="copyable"
 *   />
 * 
 *   <AppDetailRow
 *     icon={Timer}
 *     label="Auto-logout"
 *     value="15 minutes"
 *     variant="select"
 *     onSelect={() => setShowSheet(true)}
 *   />
 * 
 * ENFORCEMENT:
 * - All label/value displays must use this component
 * - No one-off detail row styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type AppDetailRowVariant = "readonly" | "editable" | "select" | "copyable" | "toggle";

interface AppDetailRowProps {
  /** Row label */
  label: string;
  /** Row value (for readonly/editable/select/copyable) */
  value?: string | React.ReactNode | null | undefined;
  /** Visual variant */
  variant?: AppDetailRowVariant;
  /** Icon component to display (optional) */
  icon?: React.ElementType;
  /** Helper text displayed below label (for toggle) or below value (for others) */
  helperText?: string;
  /** CTA button text for editable variant */
  ctaLabel?: string;
  /** CTA callback for editable variant */
  onCta?: () => void;
  /** Click handler for select variant */
  onSelect?: () => void;
  /** Toggle state (for toggle variant) */
  checked?: boolean;
  /** Toggle change handler (for toggle variant) */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether the row is disabled/locked by policy */
  locked?: boolean;
  /** Lock reason displayed as helper text when locked */
  lockReason?: string;
  /** Additional className */
  className?: string;
}

export function AppDetailRow({
  label,
  value,
  variant = "readonly",
  icon: Icon,
  helperText,
  ctaLabel = "Edit",
  onCta,
  onSelect,
  checked,
  onCheckedChange,
  locked = false,
  lockReason = "Enforced by workspace policy",
  className,
}: AppDetailRowProps) {
  const displayValue = value ?? "—";
  const hasValue = value !== null && value !== undefined && value !== "";
  const isStringValue = typeof value === "string";

  const handleCopy = async () => {
    if (!hasValue || !isStringValue) return;

    try {
      await navigator.clipboard.writeText(value as string);
      toast({ description: "Copied" });
    } catch {
      toast({ description: "Failed to copy", variant: "destructive" });
    }
  };

  const effectiveHelperText = locked ? lockReason : helperText;

  const isSelectRow = variant === "select" && !locked && !!onSelect;
  const isCopyRow = variant === "copyable" && hasValue && isStringValue;
  const isToggleRow = variant === "toggle";
  const isInteractive = isSelectRow || isCopyRow;

  const handleRowActivate = () => {
    if (isSelectRow) return onSelect?.();
    if (isCopyRow) return handleCopy();
  };

  // Toggle variant - same py-3 as standard rows for consistency
  if (isToggleRow) {
    return (
      <div
        className={cn(
          "px-5 py-3",
          "w-full max-w-full min-w-0",
          className
        )}
      >
        {/* Label row with switch on right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span>{label}</span>
          </div>
          <Switch
            checked={checked ?? false}
            onCheckedChange={onCheckedChange}
            disabled={locked}
            aria-label={label}
          />
        </div>
        
        {/* Helper text - same mt-0.5 spacing */}
        {effectiveHelperText && (
          <div className="text-xs text-muted-foreground mt-1">
            {effectiveHelperText}
          </div>
        )}
      </div>
    );
  }

  // Standard stacked layout - clean vertical flow
  return (
    <div
        className={cn(
          "px-5 py-3",
          "w-full max-w-full min-w-0",
        isInteractive && "cursor-pointer hover:bg-accent/40 transition-colors duration-150",
        className
      )}
      onClick={isInteractive ? handleRowActivate : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={(e) => {
        if (!isInteractive) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRowActivate();
        }
      }}
    >
      {/* Line 1: Icon + Label */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span>{label}</span>
        
        {/* Action buttons inline with label */}
        {variant === "editable" && !locked && onCta && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCta();
            }}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {ctaLabel}
          </button>
        )}
        
        {variant === "select" && !locked && (
          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/50" strokeWidth={1.5} />
        )}
        
        {variant === "copyable" && hasValue && isStringValue && (
          <div className="ml-auto">
            <CopyButton value={value as string} size="sm" label={`Copy ${label}`} />
          </div>
        )}
      </div>
      
      {/* Line 2: Value */}
      <div 
        className={cn(
          "text-sm font-medium mt-1",
          locked ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {displayValue}
      </div>
      
      {/* Line 3: Helper text (if any) */}
      {effectiveHelperText && (
        <div className="text-xs text-muted-foreground mt-0.5">
          {effectiveHelperText}
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
        divided && "divide-y divide-border",
        className
      )}
    >
      {children}
    </div>
  );
}
