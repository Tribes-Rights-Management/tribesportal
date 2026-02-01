import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * APP PAGE HEADER — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL PAGE HEADER COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Simplified page header with:
 * - Optional back link (for child pages)
 * - Title (required)
 * - Optional action slot (buttons, etc.)
 * 
 * NOTE: eyebrow and description props are kept for backwards compatibility
 * but are no longer rendered per the new design standard.
 * 
 * USAGE:
 *   <AppPageHeader
 *     backLink={{ to: "/help", label: "Overview" }}
 *     title="Article Editor"
 *     action={<AppButton>Save</AppButton>}
 *   />
 * 
 * ENFORCEMENT:
 * - All pages must use this component for headers
 * - No one-off header styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface BackLinkProps {
  to: string;
  label: string;
}

interface AppPageHeaderProps {
  /** Back link to parent page */
  backLink?: BackLinkProps;
  /** @deprecated No longer rendered - kept for backwards compatibility */
  eyebrow?: string;
  /** Main page title */
  title: string;
  /** @deprecated No longer rendered - kept for backwards compatibility */
  description?: string;
  /** Optional action slot (buttons, etc.) */
  action?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function AppPageHeader({
  backLink,
  eyebrow: _eyebrow, // Deprecated, not rendered
  title,
  description: _description, // Deprecated, not rendered
  action,
  className,
}: AppPageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8", className)}>
      <div className="min-w-0 flex-1">
        {backLink && (
          <Link 
            to={backLink.to} 
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-2 min-h-[44px] sm:min-h-0 py-2 sm:py-0"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span>{backLink.label}</span>
          </Link>
        )}
        <h1 className="text-[18px] sm:text-[20px] font-semibold text-foreground leading-tight">
          {title}
        </h1>
      </div>
      {action && <div className="shrink-0 self-start">{action}</div>}
    </div>
  );
}
