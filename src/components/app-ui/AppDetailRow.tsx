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

  // Toggle variant has its own layout
  if (isToggleRow) {
    return (
      <div
        className={cn(
          "px-4 py-4",
          "flex items-center justify-between gap-4",
          "w-full max-w-full min-w-0",
          className
        )}
      >
        {/* Left side: Icon + Label + Helper */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {Icon && (
            <div className="h-8 w-8 rounded flex items-center justify-center shrink-0 mt-0.5 bg-muted/50">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                "text-[13px] font-medium block",
                locked ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {label}
            </span>
            {effectiveHelperText && (
              <span className="text-[12px] block mt-0.5 text-muted-foreground">
                {effectiveHelperText}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Switch */}
        <Switch
          checked={checked ?? false}
          onCheckedChange={onCheckedChange}
          disabled={locked}
          aria-label={label}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-4 py-4",
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        "w-full max-w-full min-w-0",
        isInteractive && "cursor-pointer hover:bg-muted/30 transition-colors",
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
      {/* Left side: Icon + Label */}
      <div className="flex items-center gap-3 shrink-0 min-w-0">
        {Icon && (
          <div className="h-8 w-8 rounded flex items-center justify-center shrink-0 bg-muted/50">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <span className="text-[13px] font-medium truncate text-foreground">
          {label}
        </span>
      </div>

      {/* Right side: Value + Actions */}
      <div className="flex items-center gap-2 min-w-0 sm:justify-end w-full sm:w-auto">
        {/* Value container */}
        <div className="min-w-0 flex-1 sm:flex-initial sm:text-right">
          <span
            className={cn(
              "text-[13px] block",
              isStringValue && "truncate",
              locked ? "text-muted-foreground/70" : "text-muted-foreground"
            )}
            title={isStringValue && hasValue ? (value as string) : undefined}
          >
            {displayValue}
          </span>

          {/* Helper text */}
          {effectiveHelperText && (
            <span className="text-[11px] block mt-0.5 line-clamp-2 text-muted-foreground/70">
              {effectiveHelperText}
            </span>
          )}
        </div>

        {/* Copyable: Copy button */}
        {variant === "copyable" && hasValue && isStringValue && (
          <CopyButton value={value as string} size="sm" label={`Copy ${label}`} />
        )}

        {/* Editable: CTA button */}
        {variant === "editable" && !locked && onCta && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCta();
            }}
            className="shrink-0 text-[13px] font-medium px-3 py-2 rounded transition-colors hover:bg-muted/50 min-h-[36px] text-foreground"
          >
            {ctaLabel}
          </button>
        )}

        {/* Select: Chevron */}
        {variant === "select" && !locked && (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </div>
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
