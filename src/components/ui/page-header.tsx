import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL PAGE HEADER
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Functional, not expressive
 * - Compact, restrained sizing
 * - No marketing-style emphasis
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
          <h1 className="text-[20px] font-medium text-[#111] tracking-[-0.01em]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[14px] text-[#6B6B6B]">
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
          <h2 className="text-[16px] font-medium text-[#111]">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-[#6B6B6B]">
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
