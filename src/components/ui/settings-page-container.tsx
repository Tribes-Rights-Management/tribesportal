import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SETTINGS PAGE CONTAINER — Canonical Layout for Settings Pages
 * 
 * This component ensures ALL settings pages use identical padding, 
 * max-width, and overflow rules. No per-page custom padding allowed.
 * 
 * Features:
 * - Safe-area aware horizontal padding
 * - Consistent content column max-width (720px for premium tight feel)
 * - Overflow protection
 * - Vertical spacing tokens
 */

interface SettingsPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsPageContainer({
  children,
  className,
}: SettingsPageContainerProps) {
  return (
    <div
      className={cn(
        // Full width with overflow protection
        "w-full max-w-full min-w-0 overflow-x-clip",
        // Vertical spacing - consistent across all settings pages
        "py-6 md:py-10",
        className
      )}
      style={{
        backgroundColor: 'var(--platform-canvas)',
        // Safe-area aware horizontal padding - single source of truth
        paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
        paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
      }}
    >
      {/* Content column - tight max-width for premium settings feel */}
      <div className="max-w-[720px] w-full min-w-0">
        {children}
      </div>
    </div>
  );
}

/**
 * SETTINGS SECTION CARD V2 — Updated to NOT apply its own padding
 * 
 * The parent SettingsPageContainer handles safe-area padding.
 * Cards are full-width within the content column.
 */
interface SettingsSectionCardV2Props {
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Card content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function SettingsSectionCardV2({
  title,
  description,
  children,
  className,
}: SettingsSectionCardV2Props) {
  return (
    <div
      className={cn("rounded-lg overflow-hidden w-full", className)}
      style={{
        backgroundColor: 'var(--platform-surface)',
        border: '1px solid var(--platform-border)',
      }}
    >
      {/* Header - uses internal card padding only */}
      <div
        className="px-4 py-4"
        style={{ borderBottom: '1px solid var(--platform-border)' }}
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
      <div className="w-full min-w-0">
        {children}
      </div>
    </div>
  );
}

/**
 * SETTINGS ROW V2 — Updated to NOT apply safe-area padding (handled by container)
 */
interface SettingsRowV2Props {
  /** Row label */
  label: string;
  /** Row value */
  value: React.ReactNode;
  /** Optional left icon */
  icon?: React.ElementType;
  /** Optional action element (button, link, etc.) */
  action?: React.ReactNode;
  /** Helper text below value */
  helperText?: string;
  /** Whether this is the last row (no border) */
  isLast?: boolean;
  /** Custom className */
  className?: string;
  /** Click handler for the row */
  onClick?: () => void;
}

export function SettingsRowV2({
  label,
  value,
  icon: Icon,
  action,
  helperText,
  isLast = false,
  className,
  onClick,
}: SettingsRowV2Props) {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "px-4 py-4",
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        "w-full min-w-0",
        isClickable && "cursor-pointer hover:bg-white/[0.02] transition-colors",
        className
      )}
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--platform-border)',
      }}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
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
          className="text-[13px] font-medium"
          style={{ color: 'var(--platform-text)' }}
        >
          {label}
        </span>
      </div>

      {/* Right side: Value + Action */}
      <div className="flex items-center gap-2 min-w-0 sm:justify-end w-full sm:w-auto">
        <div className="min-w-0 flex-1 sm:flex-initial sm:text-right">
          <span
            className="text-[13px] block truncate"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            {value}
          </span>
          {helperText && (
            <span
              className="text-[11px] block mt-0.5 line-clamp-2"
              style={{
                color: 'var(--platform-text-muted)',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              {helperText}
            </span>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}

export default SettingsPageContainer;
