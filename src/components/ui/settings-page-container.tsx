/**
 * @deprecated — LEGACY SETTINGS LAYOUT PRIMITIVES
 *
 * These components are DEPRECATED and should NOT be used.
 * The layout contract is now enforced by:
 * - PageShell (src/components/ui/page-shell.tsx) — owns H1 + subtitle
 * - PageContainer (src/components/ui/page-container.tsx) — owns padding + max-width
 *
 * For /account routes, AccountLayout is the single layout authority.
 * Subpages render content sections only (no containers, no headers).
 *
 * If you see imports from this file, refactor them to use PageShell + PageContainer.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * @deprecated Use PageContainer with variant="settings" instead.
 */
interface SettingsPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** @deprecated */
export function SettingsPageContainer({
  children,
  className,
}: SettingsPageContainerProps) {
  console.warn(
    "SettingsPageContainer is deprecated. Use PageContainer with variant='settings' instead."
  );
  return (
    <div
      className={cn(
        "w-full max-w-full min-w-0 overflow-x-clip",
        "py-6 md:py-10",
        className
      )}
      style={{
        backgroundColor: "var(--platform-canvas)",
        paddingLeft: "max(16px, env(safe-area-inset-left, 16px))",
        paddingRight: "max(16px, env(safe-area-inset-right, 16px))",
      }}
    >
      <div className="max-w-[720px] w-full min-w-0">{children}</div>
    </div>
  );
}

/**
 * @deprecated Use SettingsSectionCard from @/components/ui/settings-row instead.
 */
interface SettingsSectionCardV2Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** @deprecated */
export function SettingsSectionCardV2({
  title,
  description,
  children,
  className,
}: SettingsSectionCardV2Props) {
  console.warn(
    "SettingsSectionCardV2 is deprecated. Use SettingsSectionCard from @/components/ui/settings-row instead."
  );
  return (
    <div
      className={cn("rounded-lg overflow-hidden w-full", className)}
      style={{
        backgroundColor: "var(--platform-surface)",
        border: "1px solid var(--platform-border)",
      }}
    >
      <div
        className="px-4 py-4"
        style={{ borderBottom: "1px solid var(--platform-border)" }}
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
      <div className="w-full min-w-0">{children}</div>
    </div>
  );
}

/**
 * @deprecated Use SettingsRow from @/components/ui/settings-row instead.
 */
interface SettingsRowV2Props {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  action?: React.ReactNode;
  helperText?: string;
  isLast?: boolean;
  className?: string;
  onClick?: () => void;
}

/** @deprecated */
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
  console.warn(
    "SettingsRowV2 is deprecated. Use SettingsRow from @/components/ui/settings-row instead."
  );
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
        borderBottom: isLast ? "none" : "1px solid var(--platform-border)",
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
      <div className="flex items-center gap-3 shrink-0 min-w-0">
        {Icon && (
          <div
            className="h-8 w-8 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <Icon className="h-4 w-4" style={{ color: "var(--platform-text-secondary)" }} />
          </div>
        )}
        <span className="text-[13px] font-medium" style={{ color: "var(--platform-text)" }}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2 min-w-0 sm:justify-end w-full sm:w-auto">
        <div className="min-w-0 flex-1 sm:flex-initial sm:text-right">
          <span className="text-[13px] block truncate" style={{ color: "var(--platform-text-secondary)" }}>
            {value}
          </span>
          {helperText && (
            <span
              className="text-[11px] block mt-0.5 line-clamp-2"
              style={{
                color: "var(--platform-text-muted)",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
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
