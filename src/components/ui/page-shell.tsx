import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAGE SHELL — CANONICAL PAGE HEADER SYSTEM (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * The universal page header component for the entire application.
 * Provides consistent title, subtitle, back navigation, and actions.
 * 
 * STRUCTURE:
 * - Back button (optional) — links to parent route
 * - Title + subtitle block
 * - Action slot (optional) — for primary page actions
 * 
 * RULES:
 * - Only ONE PageShell per page (no duplicate headers)
 * - Pages must NOT render additional H1 elements
 * - Back button uses explicit parent path (not browser history)
 * 
 * Usage:
 * <PageShell 
 *   title="Member Directory" 
 *   subtitle="12 accounts"
 *   backTo="/admin"
 *   backLabel="System Console"
 * >
 *   <Button>Add Member</Button>
 * </PageShell>
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface PageShellProps {
  /** Page title (H1) */
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Parent route for back navigation */
  backTo?: string;
  /** Accessible label for back button */
  backLabel?: string;
  /** Optional actions (buttons) aligned right */
  children?: React.ReactNode;
  /** Optional className for the container */
  className?: string;
  /** Centered title (for pages like Organizations) */
  centered?: boolean;
}

export function PageShell({
  title,
  subtitle,
  backTo,
  backLabel = "Back",
  children,
  className,
  centered = false,
}: PageShellProps) {
  return (
    <div 
      className={cn(
        backTo ? "page-header-with-nav" : "page-header",
        centered && "justify-between min-h-[56px]",
        className
      )}
    >
      {/* Back button */}
      {backTo && (
        <Link 
          to={backTo}
          className={cn(
            "h-11 w-11 sm:h-8 sm:w-8 rounded-lg sm:rounded flex items-center justify-center",
            "transition-colors shrink-0 -ml-2",
          )}
          style={{ color: 'var(--platform-text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--muted) / 0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label={backLabel}
        >
          <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" />
        </Link>
      )}
      
      {/* Title block */}
      {centered ? (
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <h1 className="page-title whitespace-nowrap">
            {title}
          </h1>
          {subtitle && (
            <p 
              className="text-[12px] sm:text-[14px] mt-0.5"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      ) : (
        <div className="min-w-0 flex-1">
          <h1 className="page-title">
            {title}
          </h1>
          {subtitle && (
            <p 
              className="text-[14px] sm:text-[15px] mt-0.5"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {/* Actions slot */}
      {children && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * PAGE CONTENT — Wrapper for main page content
 * 
 * Provides consistent max-width and padding for page content.
 * Use inside the page, after PageShell.
 */
interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  /** Max content width */
  maxWidth?: "narrow" | "medium" | "wide" | "full";
}

const maxWidthMap = {
  narrow: "640px",
  medium: "720px",
  wide: "960px",
  full: "100%",
} as const;

export function PageContent({
  children,
  className,
  maxWidth = "wide",
}: PageContentProps) {
  return (
    <div 
      className={cn("w-full min-w-0", className)}
      style={{ maxWidth: maxWidthMap[maxWidth], marginLeft: "auto", marginRight: "auto" }}
    >
      {children}
    </div>
  );
}

/**
 * CONTENT PANEL — Bordered container for page content
 * 
 * Standard card/panel styling for content blocks.
 */
interface ContentPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentPanel({ children, className }: ContentPanelProps) {
  return (
    <div 
      className={cn("rounded-lg sm:rounded overflow-hidden", className)}
      style={{ 
        backgroundColor: 'var(--platform-surface)',
        border: '1px solid var(--platform-border)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * EMPTY STATE — Consistent empty state display
 */
interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div 
      className={cn("py-16 text-center px-4", className)}
      style={{ color: 'var(--platform-text-secondary)' }}
    >
      <p className="text-[14px]">{title}</p>
      {description && (
        <p 
          className="text-[13px] mt-1" 
          style={{ color: 'var(--platform-text-muted)' }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * LOADING STATE — Consistent loading state display
 */
interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ 
  message = "Retrieving records", 
  className 
}: LoadingStateProps) {
  return (
    <div 
      className={cn("py-16 text-center text-[14px]", className)}
      style={{ color: 'var(--platform-text-secondary)' }}
    >
      {message}
    </div>
  );
}