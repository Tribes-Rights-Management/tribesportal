import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * APP PAGE LAYOUT — CANONICAL TWO-ZONE PAGE STRUCTURE
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * ENFORCES CONSISTENT TITLE PLACEMENT ACROSS ALL PAGES (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Two zones:
 *   ZONE 1 — Page Header: fixed vertical position, never affected by body container
 *   ZONE 2 — Page Body: scrollable content area, can use any layout
 * 
 * USAGE:
 *   <AppPageLayout
 *     title="Catalog"
 *     action={<AppButton>Add Song</AppButton>}
 *   >
 *     {/* page body content *\/}
 *   </AppPageLayout>
 * 
 * ENFORCEMENT:
 * - All pages must use this component for layout
 * - Page titles must NOT be placed inside page body containers
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface BackLinkProps {
  to: string;
  label: string;
}

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface AppPageLayoutProps {
  /** Page title (required) */
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Optional className for the subtitle */
  subtitleClassName?: string;
  /** Optional action slot (buttons, filters, etc.) — rendered right-aligned */
  action?: React.ReactNode;
  /** Optional back link */
  backLink?: BackLinkProps;
  /** Maximum width constraint for both zones */
  maxWidth?: MaxWidth;
  /** Additional className for the body zone */
  bodyClassName?: string;
  /** Children render inside the body zone */
  children: React.ReactNode;
}

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-full",
};

export function AppPageLayout({
  title,
  subtitle,
  subtitleClassName,
  action,
  backLink,
  maxWidth = "xl",
  bodyClassName,
  children,
}: AppPageLayoutProps) {
  return (
    <div className="w-full">
      {/* ZONE 1: Page Header — fixed position, never affected by body container */}
      <div
        className={cn(
          "page-header-zone px-6 sm:px-8 mx-auto w-full",
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="flex items-center gap-3 min-h-[44px]">
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
          <div className="min-w-0 flex-1">
            <h1 className="page-title">{title}</h1>
            {subtitle && (
              <p className={cn("text-sm text-muted-foreground mt-0.5", subtitleClassName)}>
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex items-center gap-2 shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>

      {/* ZONE 2: Page Body — content area with consistent top spacing */}
      <div
        className={cn(
          "pt-5 px-6 sm:px-8 mx-auto w-full",
          maxWidthClasses[maxWidth],
          bodyClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
