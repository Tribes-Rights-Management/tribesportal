import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * ADMIN ROW COMPONENTS — CANONICAL SYSTEM CONSOLE ROWS (INSTITUTIONAL STANDARD)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * TWO DISTINCT ROW TYPES:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. AdminMetricRow — STATS (read-only metrics)
 *    - Subtle left border accent (muted blue-gray)
 *    - Compact height, no description
 *    - Value on right, label on left
 *    - Used in: Governance Overview
 * 
 * 2. AdminListRow — NAVIGATION (links to sub-pages)
 *    - No left border (clean edge)
 *    - Title + optional description
 *    - Chevron indicates navigation
 *    - Used in: All other sections
 * 
 * VISUAL DIFFERENTIATION:
 * - Stats rows have a 2px left border accent
 * - Navigation rows have no left accent
 * - This creates instant visual recognition of "data vs action"
 * 
 * MOBILE READABILITY RULES (NON-NEGOTIABLE):
 * - Title: Single-line, truncate with ellipsis if needed
 * - Description: Wraps to 2 lines max, then truncates
 * - Parent flex containers include min-w-0
 * - Right-side space reserved for chevrons (no overlap)
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AdminListRowProps {
  /** Navigation target */
  to: string;
  /** Primary title - single line, truncate ok */
  title: string;
  /** Secondary description - wraps to 2 lines, then truncates */
  description?: string;
  /** Optional trailing value (e.g., count, status) */
  trailing?: string | React.ReactNode;
  /** Whether the trailing value should be highlighted */
  highlightTrailing?: boolean;
  /** Show chevron icon (default: true) */
  showChevron?: boolean;
  /** Optional click handler (alternative to navigation) */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

export function AdminListRow({
  to,
  title,
  description,
  trailing,
  highlightTrailing = false,
  showChevron = true,
  onClick,
  className,
}: AdminListRowProps) {
  const content = (
    <>
      {/* Left: Title + Description */}
      <div className="min-w-0 flex-1">
        <p 
          className="text-[13px] md:text-[14px] truncate font-medium"
          style={{ color: 'var(--platform-text)' }}
        >
          {title}
        </p>
        {description && (
          <p 
            className="text-[11px] md:text-[12px] mt-0.5 line-clamp-2 break-words"
            style={{ 
              color: 'var(--platform-text-muted)', 
              opacity: 0.7,
              lineHeight: '1.45',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Right: Trailing value + Chevron */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {trailing && (
          <span 
            className="text-[13px] md:text-[14px] font-medium tabular-nums"
            style={{ 
              color: highlightTrailing ? 'var(--platform-text)' : 'var(--platform-text-muted)'
            }}
          >
            {trailing}
          </span>
        )}
        {showChevron && (
          <ChevronRight 
            className="h-3.5 w-3.5 shrink-0 opacity-30 group-hover:opacity-50 transition-opacity"
            style={{ color: 'var(--platform-text-muted)' }}
          />
        )}
      </div>
    </>
  );

  const baseClassName = cn(
    "flex items-center justify-between gap-3 px-4 md:px-5 row-density row-hover",
    "group",
    className
  );

  const baseStyle: React.CSSProperties = { 
    borderBottom: '1px solid var(--platform-border)',
  };

  // For onClick handlers, use div with role="button" for accessibility
  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(baseClassName, "w-full text-left")}
        style={baseStyle}
      >
        {content}
      </div>
    );
  }

  return (
    <Link 
      to={to} 
      className={baseClassName}
      style={baseStyle}
    >
      {content}
    </Link>
  );
}

/**
 * ADMIN METRIC ROW — Read-only stat with subtle left accent
 * 
 * Visual distinction from navigation rows:
 * - 3px left border accent (visible but institutional)
 * - More compact (no description)
 * - Label left, value right
 * - Visible background tint on hover
 */
interface AdminMetricRowProps {
  to: string;
  label: string;
  value: string;
  highlight?: boolean;
}

export function AdminMetricRow({ 
  to, 
  label, 
  value,
  highlight = false
}: AdminMetricRowProps) {
  return (
    <Link 
      to={to} 
      className="relative flex items-center justify-between px-4 md:px-5 py-3 md:py-3.5 row-hover group"
      style={{ 
        borderBottom: '1px solid var(--platform-border)',
      }}
    >
      {/* Left accent bar — distinguishes stats from navigation */}
      <div 
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-sm"
        style={{ 
          backgroundColor: highlight 
            ? 'rgba(59, 130, 246, 0.6)'   // Blue accent for highlighted metrics
            : 'rgba(255, 255, 255, 0.15)' // More visible gray for normal metrics
        }}
      />
      
      <span 
        className="text-[13px] md:text-[14px] min-w-0 flex-1 pl-2"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2.5 shrink-0">
        <span 
          className="text-[14px] md:text-[15px] font-semibold tabular-nums"
          style={{ 
            color: highlight ? 'var(--platform-text)' : 'var(--platform-text-muted)'
          }}
        >
          {value}
        </span>
        <ChevronRight 
          className="h-3.5 w-3.5 opacity-25 group-hover:opacity-50 transition-opacity"
          style={{ color: 'var(--platform-text-muted)' }}
        />
      </div>
    </Link>
  );
}

/**
 * ADMIN SECTION — Sparse grouping with small caps label
 * 
 * Contains either metric rows OR navigation rows (not mixed)
 */
interface AdminSectionProps {
  label: string;
  children: React.ReactNode;
  /** Optional: adds subtle top padding for visual breathing room */
  variant?: 'default' | 'compact';
}

export function AdminSection({ label, children, variant = 'default' }: AdminSectionProps) {
  return (
    <section className={cn(
      variant === 'compact' ? 'mb-6 md:mb-8' : 'mb-8 md:mb-10'
    )}>
      <h2 
        className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.1em] mb-2.5 md:mb-3"
        style={{ color: 'var(--platform-text-muted)', opacity: 0.6 }}
      >
        {label}
      </h2>
      <div 
        className="rounded-md overflow-hidden"
        style={{ 
          backgroundColor: 'var(--platform-surface-2)',
          border: '1px solid var(--platform-border)',
        }}
      >
        {children}
      </div>
    </section>
  );
}