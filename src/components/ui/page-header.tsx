import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL PAGE HEADER — CANONICAL
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Uses platform dark-theme tokens
 * - Functional, not expressive
 * - Compact, restrained sizing
 * - Dense vertical rhythm
 */

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  children,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 
            className="text-[20px] font-medium tracking-[-0.01em]"
            style={{ color: 'var(--platform-text)' }}
          >
            {title}
          </h1>
          {description && (
            <p 
              className="mt-1 text-[14px]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3">
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 
            className="text-[16px] font-medium"
            style={{ color: 'var(--platform-text)' }}
          >
            {title}
          </h2>
          {description && (
            <p 
              className="mt-0.5 text-[13px]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
