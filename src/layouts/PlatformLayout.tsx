import { cn } from "@/lib/utils";

/**
 * PLATFORM LAYOUT — CANONICAL INSTITUTIONAL SHELL (AUTHORITATIVE)
 * 
 * This component is the single source of truth for all authenticated pages.
 * 
 * ENFORCED STANDARDS:
 * - Dark canvas (matches website exactly - #0B0F14 via --tribes-bg)
 * - Content rendered on elevated surfaces (cards/panels)
 * - Centered content column (max-width ~960-1040px)
 * - Shared typography scale
 * - Shared spacing tokens
 * - No page-level overrides allowed
 * 
 * SURFACE ELEVATION (via tribes-theme.css):
 * - Page background: --tribes-bg (#0B0F14)
 * - Header: --tribes-header-bg (#111214)
 * - Content surfaces: --tribes-surface (rgba white overlay)
 * 
 * PROHIBITED OVERRIDES:
 * - Background color
 * - Typography scale
 * - Content width
 * - Spacing tokens
 * 
 * Any page that does not use PlatformLayout or InstitutionalPage
 * is a regression and should fail review.
 */

interface PlatformLayoutProps {
  children: React.ReactNode;
  /** Maximum content width - defaults to 960px (narrow) */
  maxWidth?: "narrow" | "medium" | "wide" | "full";
  className?: string;
  /** Padding configuration */
  padding?: "default" | "compact" | "none";
  /** Whether to wrap content in an elevated card surface */
  elevated?: boolean;
}

const MAX_WIDTH_MAP = {
  narrow: "max-w-[960px]",
  medium: "max-w-[1040px]",
  wide: "max-w-[1200px]",
  full: "max-w-full",
};

const PADDING_MAP = {
  default: "py-10 px-6",
  compact: "py-6 px-6",
  none: "",
};

export function PlatformLayout({
  children,
  maxWidth = "narrow",
  className,
  padding = "default",
  elevated = false,
}: PlatformLayoutProps) {
  return (
    <div
      className={cn("min-h-full", PADDING_MAP[padding])}
      style={{ backgroundColor: "var(--page-bg)" }}
    >
      {elevated ? (
        <div 
          className={cn(MAX_WIDTH_MAP[maxWidth], "mx-auto rounded-lg", className)}
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="p-6 md:p-8">
            {children}
          </div>
        </div>
      ) : (
        <div className={cn(MAX_WIDTH_MAP[maxWidth], "mx-auto", className)}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * INSTITUTIONAL PAGE HEADER — CANONICAL
 * 
 * Standard page header for all institutional pages.
 * Uses platform tokens for consistent dark-theme typography.
 */
interface InstitutionalHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function InstitutionalHeader({
  title,
  description,
  children,
  className,
}: InstitutionalHeaderProps) {
  return (
    <header className={cn("mb-8", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-[28px] font-semibold tracking-[-0.02em] text-foreground"
          >
            {title}
          </h1>
          {description && (
            <p
              className="text-[15px] mt-1.5 leading-relaxed text-muted-foreground"
            >
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3 shrink-0">{children}</div>
        )}
      </div>
    </header>
  );
}

/**
 * INSTITUTIONAL SECTION — CANONICAL
 * 
 * Standard section container with optional header.
 * Uses platform surface + border tokens.
 */
interface InstitutionalSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function InstitutionalSection({
  children,
  title,
  description,
  className,
}: InstitutionalSectionProps) {
  return (
    <section className={cn("mb-6", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-[16px] font-medium text-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-[13px] mt-0.5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * INSTITUTIONAL PANEL — CANONICAL
 * 
 * Standard panel container for content grouping.
 * Dark surface with subtle border.
 */
interface InstitutionalPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function InstitutionalPanel({
  children,
  className,
}: InstitutionalPanelProps) {
  return (
    <div
      className={cn("rounded overflow-hidden", className)}
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * INSTITUTIONAL DIVIDER — CANONICAL
 * 
 * Hairline divider using platform border token.
 */
export function InstitutionalDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px", className)}
      style={{ backgroundColor: "var(--border-subtle)" }}
    />
  );
}

export default PlatformLayout;
