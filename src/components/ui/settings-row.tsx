import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/ui/copy-button";
import { Switch } from "@/components/ui/switch";

/**
 * SETTINGS ROW — Universal Settings Row Component
 *
 * Variants:
 * - readonly: label + single-line value + optional helper text
 * - editable: label + value + CTA like "Edit" / "Change"
 * - select: label + current selection + chevron (opens picker/modal)
 * - copyable: label + single-line value + copy icon
 * - toggle: label + description + iOS-style switch
 *
 * Identifiers (emails, IDs) never wrap - enforced via truncation.
 * Mobile: single-column stacked layout with full-width values.
 *
 * NOTE: Safe-area padding is handled by PageContainer in the parent layout.
 * This component provides internal card padding only.
 */

export type SettingsRowVariant = "readonly" | "editable" | "select" | "copyable" | "toggle";

interface SettingsRowProps {
  /** Row label */
  label: string;
  /** Row value (for readonly/editable/select/copyable) */
  value?: string | null | undefined;
  /** Visual variant */
  variant?: SettingsRowVariant;
  /** Icon to display (optional) */
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
  /** Custom className */
  className?: string;
}

export function SettingsRow({
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
}: SettingsRowProps) {
  const displayValue = value || "—";
  const hasValue = value !== null && value !== undefined && value !== "";

  const handleCopy = async () => {
    if (!hasValue) return;

    try {
      await navigator.clipboard.writeText(value!);
      toast({ description: "Copied" });
    } catch {
      toast({ description: "Failed to copy", variant: "destructive" });
    }
  };

  const effectiveHelperText = locked ? lockReason : helperText;

  const isSelectRow = variant === "select" && !locked && !!onSelect;
  const isCopyRow = variant === "copyable" && hasValue;
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
          "px-4 row-density",
          "flex items-center justify-between gap-4",
          "w-full max-w-full min-w-0 overflow-x-clip",
          className
        )}
        style={{
          borderBottom: "1px solid var(--platform-border)",
        }}
      >
        {/* Left side: Icon + Label + Helper */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {Icon && (
            <div
              className="h-8 w-8 rounded flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <Icon className="h-4 w-4" style={{ color: "var(--platform-text-secondary)" }} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span
              className="text-[13px] font-medium block"
              style={{ color: locked ? "var(--platform-text-muted)" : "var(--platform-text)" }}
            >
              {label}
            </span>
            {effectiveHelperText && (
              <span
                className="text-[12px] block mt-0.5"
                style={{ color: "var(--platform-text-muted)" }}
              >
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
        // Internal card padding only
        "px-4 row-density",
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        "w-full max-w-full min-w-0 overflow-x-clip",
        isSelectRow && "cursor-pointer hover:bg-white/[0.02] transition-colors",
        isCopyRow && "cursor-pointer hover:bg-white/[0.02] transition-colors",
        className
      )}
      style={{
        borderBottom: "1px solid var(--platform-border)",
      }}
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
          <div
            className="h-8 w-8 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <Icon className="h-4 w-4" style={{ color: "var(--platform-text-secondary)" }} />
          </div>
        )}
        <span
          className="text-[13px] font-medium truncate"
          style={{ color: "var(--platform-text)" }}
        >
          {label}
        </span>
      </div>

      {/* Right side: Value + Actions */}
      <div className="flex items-center gap-2 min-w-0 sm:justify-end w-full sm:w-auto">
        {/* Value container */}
        <div className="min-w-0 flex-1 sm:flex-initial sm:text-right">
          <span
            className="text-[13px] block truncate"
            style={{
              color: locked ? "var(--platform-text-muted)" : "var(--platform-text-secondary)",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
            title={hasValue ? value : undefined}
          >
            {displayValue}
          </span>

          {/* Helper text */}
          {effectiveHelperText && (
            <span
              className="text-[11px] block mt-0.5 line-clamp-2"
              style={{
                color: "var(--platform-text-muted)",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {effectiveHelperText}
            </span>
          )}
        </div>

        {/* Copyable: Copy button (canonical) */}
        {variant === "copyable" && hasValue && (
          <CopyButton value={value!} size="sm" label={`Copy ${label}`} />
        )}

        {/* Editable: CTA button */}
        {variant === "editable" && !locked && onCta && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCta();
            }}
            className="shrink-0 text-[13px] font-medium px-3 py-2 rounded transition-colors hover:bg-white/[0.06] min-h-[44px]"
            style={{ color: "var(--platform-text)" }}
          >
            {ctaLabel}
          </button>
        )}

        {/* Select: Chevron */}
        {variant === "select" && !locked && (
          <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--platform-text-muted)" }} />
        )}
      </div>
    </div>
  );
}

/**
 * Settings Section Card — Container for SettingsRow items
 *
 * NOTE: Safe-area padding is handled by PageContainer in the parent layout.
 * This component provides internal card padding only.
 */
interface SettingsSectionCardProps {
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Card content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function SettingsSectionCard({
  title,
  description,
  children,
  className,
}: SettingsSectionCardProps) {
  return (
    <div
      className={cn("rounded-lg overflow-hidden w-full max-w-full", className)}
      style={{
        backgroundColor: "var(--platform-surface)",
        border: "1px solid var(--platform-border)",
      }}
    >
      {/* Header - internal card padding only */}
      <div
        className="px-4 py-4"
        style={{
          borderBottom: "1px solid var(--platform-border)",
        }}
      >
        <h2 className="text-[15px] font-medium" style={{ color: "var(--platform-text)" }}>
          {title}
        </h2>
        {description && (
          <p
            className="text-[13px] mt-0.5 line-clamp-2"
            style={{
              color: "var(--platform-text-secondary)",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="w-full max-w-full min-w-0">{children}</div>
    </div>
  );
}

/**
 * @deprecated Use PageShell from @/components/ui/page-shell instead.
 * This component is preserved for backward compatibility but should not be used.
 * The H1 is now owned by AccountLayout (or other parent layouts) via PageShell.
 */
interface SettingsPageHeaderProps {
  title: string;
  description?: string;
}

/** @deprecated */
export function SettingsPageHeader({ title, description }: SettingsPageHeaderProps) {
  console.warn(
    "SettingsPageHeader is deprecated. Use PageShell from @/components/ui/page-shell instead."
  );
  return (
    <div className="mb-6 md:mb-10">
      <h1
        className="text-[22px] md:text-[28px] font-semibold tracking-[-0.02em]"
        style={{ color: "var(--platform-text)" }}
      >
        {title}
      </h1>
      {description && (
        <p
          className="text-[14px] md:text-[15px] mt-0.5"
          style={{ color: "var(--platform-text-secondary)" }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Settings Footer Notice — Policy/governance notice at bottom of settings pages
 */
interface SettingsFooterNoticeProps {
  children: React.ReactNode;
}

export function SettingsFooterNotice({ children }: SettingsFooterNoticeProps) {
  return (
    <p
      className="mt-4 md:mt-6 text-[12px] md:text-[13px]"
      style={{ color: "var(--platform-text-muted)" }}
    >
      {children}
    </p>
  );
}
