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
    <div className={cn("flex items-center gap-3 pt-6 pb-6 sm:pt-8 sm:pb-6", className)}>
      {/* Back button - inline with title */}
      {backLink && (
        <Link 
          to={backLink.to} 
          className={cn(
            "h-11 w-11 sm:h-8 sm:w-8 rounded-lg sm:rounded flex items-center justify-center",
            "transition-colors shrink-0 -ml-2",
            "text-muted-foreground hover:bg-muted/50"
          )}
          aria-label={backLink.label}
        >
          <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" strokeWidth={1.5} />
        </Link>
      )}
      
      {/* Title block */}
      <div className="min-w-0 flex-1">
        <h1 className="text-[20px] sm:text-[24px] font-semibold text-foreground leading-tight tracking-[-0.02em]">
          {title}
        </h1>
      </div>
      
      {/* Actions slot */}
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
