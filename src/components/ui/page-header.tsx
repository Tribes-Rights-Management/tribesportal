import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL PAGE HEADER — CANONICAL
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Uses platform dark-theme tokens
 * - Functional, not expressive
 * - Compact, restrained sizing
 * - Dense vertical rhythm
 * - No text clipping - uses h-auto, min-h-*, proper line-height
 * 
 * NOTE: description prop is kept for backwards compatibility
 * but is no longer rendered per the new design standard.
 */

interface PageHeaderProps {
  title: string;
  /** @deprecated No longer rendered - kept for backwards compatibility */
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description: _description, // Deprecated, not rendered
  children,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="page-title">{title}</h1>
        </div>
        {children && (
          <div className="flex items-center gap-3 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * INSTITUTIONAL SECTION HEADER
 * 
 * For subsections within pages
 * - No fixed heights
 * - Readable line heights
 * - No text clipping
 */
interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ 
  title, 
  description, 
  children,
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 
            className="text-[15px] sm:text-[16px] font-medium leading-[1.3]"
            style={{ color: 'var(--platform-text)' }}
          >
            {title}
          </h2>
          {description && (
            <p 
              className="mt-0.5 text-[12px] sm:text-[13px] leading-[1.5]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-2 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
