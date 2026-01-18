import * as React from "react";
import { Copy, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

/**
 * SETTINGS ROW — Universal Settings Row Component
 * 
 * Variants:
 * - readonly: label + single-line value + optional helper text
 * - editable: label + value + CTA like "Edit" / "Change"
 * - select: label + current selection + chevron (opens picker/modal)
 * - copyable: label + single-line value + copy icon
 * 
 * Identifiers (emails, IDs) never wrap - enforced via truncation.
 * Mobile: single-column stacked layout with full-width values.
 */

export type SettingsRowVariant = "readonly" | "editable" | "select" | "copyable";

interface SettingsRowProps {
  /** Row label */
  label: string;
  /** Row value */
  value: string | null | undefined;
  /** Visual variant */
  variant?: SettingsRowVariant;
  /** Icon to display (optional) */
  icon?: React.ElementType;
  /** Helper text displayed below value */
  helperText?: string;
  /** CTA button text for editable variant */
  ctaLabel?: string;
  /** CTA callback for editable variant */
  onCta?: () => void;
  /** Click handler for select variant */
  onSelect?: () => void;
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
  locked = false,
  lockReason = "Enforced by workspace policy",
  className,
}: SettingsRowProps) {
  const [copied, setCopied] = React.useState(false);
  const displayValue = value || "—";
  const hasValue = value !== null && value !== undefined && value !== "";

  const handleCopy = async () => {
    if (!hasValue) return;
    
    try {
      await navigator.clipboard.writeText(value!);
      setCopied(true);
      toast({ description: "Copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ description: "Failed to copy", variant: "destructive" });
    }
  };

  const effectiveHelperText = locked ? lockReason : helperText;

  return (
    <div 
      className={cn(
        "py-4",
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        "w-full max-w-full min-w-0 overflow-x-clip",
        variant === "select" && !locked && "cursor-pointer hover:bg-white/[0.02] transition-colors",
        className
      )}
      style={{ 
        borderBottom: '1px solid var(--platform-border)',
        paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
        paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
      }}
      onClick={variant === "select" && !locked ? onSelect : undefined}
      role={variant === "select" && !locked ? "button" : undefined}
      tabIndex={variant === "select" && !locked ? 0 : undefined}
      onKeyDown={(e) => {
        if (variant === "select" && !locked && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      {/* Left side: Icon + Label */}
      <div className="flex items-center gap-3 shrink-0 min-w-0">
        {Icon && (
          <div 
            className="h-8 w-8 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <Icon className="h-4 w-4" style={{ color: 'var(--platform-text-secondary)' }} />
          </div>
        )}
        <span 
          className="text-[13px] font-medium truncate"
          style={{ color: 'var(--platform-text)' }}
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
              color: locked ? 'var(--platform-text-muted)' : 'var(--platform-text-secondary)',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
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
                color: 'var(--platform-text-muted)',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              {effectiveHelperText}
            </span>
          )}
        </div>

        {/* Copyable: Copy button */}
        {variant === "copyable" && hasValue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="shrink-0 p-2 rounded transition-colors hover:bg-white/[0.06] min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--platform-text-muted)' }}
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4" style={{ color: '#4ade80' }} />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
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
            style={{ color: 'var(--platform-text)' }}
          >
            {ctaLabel}
          </button>
        )}

        {/* Select: Chevron */}
        {variant === "select" && !locked && (
          <ChevronRight 
            className="h-4 w-4 shrink-0" 
            style={{ color: 'var(--platform-text-muted)' }} 
          />
        )}
      </div>
    </div>
  );
}

/**
 * Settings Section Card — Container for SettingsRow items
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
        backgroundColor: 'var(--platform-surface)',
        border: '1px solid var(--platform-border)'
      }}
    >
      {/* Header */}
      <div 
        className="py-4"
        style={{ 
          borderBottom: '1px solid var(--platform-border)',
          paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
          paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
        }}
      >
        <h2 
          className="text-[15px] font-medium"
          style={{ color: 'var(--platform-text)' }}
        >
          {title}
        </h2>
        {description && (
          <p 
            className="text-[13px] mt-0.5 line-clamp-2"
            style={{ 
              color: 'var(--platform-text-secondary)',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="w-full max-w-full min-w-0">
        {children}
      </div>
    </div>
  );
}

/**
 * Settings Page Header — Consistent page header for settings pages
 */
interface SettingsPageHeaderProps {
  title: string;
  description?: string;
}

export function SettingsPageHeader({ title, description }: SettingsPageHeaderProps) {
  return (
    <div className="mb-6 md:mb-10">
      <h1 
        className="text-[22px] md:text-[28px] font-semibold tracking-[-0.02em]"
        style={{ color: 'var(--platform-text)' }}
      >
        {title}
      </h1>
      {description && (
        <p 
          className="text-[14px] md:text-[15px] mt-0.5"
          style={{ color: 'var(--platform-text-secondary)' }}
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
      style={{ color: 'var(--platform-text-muted)' }}
    >
      {children}
    </p>
  );
}
