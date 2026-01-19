import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * ADMIN LIST ROW — CANONICAL ROW COMPONENT (INSTITUTIONAL STANDARD)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MOBILE READABILITY RULES (NON-NEGOTIABLE):
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. TITLE: Single-line, truncate with ellipsis if needed
 * 2. DESCRIPTION: Must wrap up to TWO lines, then truncate
 *    - Uses: line-clamp-2 + break-words + overflow-hidden
 *    - NO single-line truncation on descriptions
 * 3. LAYOUT SAFEGUARDS:
 *    - Parent flex containers include min-w-0
 *    - Right-side space reserved for chevrons/icons (no overlap)
 *    - Row height expands naturally for 2-line descriptions
 * 
 * USAGE:
 * <AdminListRow
 *   to="/admin/some-page"
 *   title="Row Title"
 *   description="Optional secondary text that can wrap to two lines"
 *   trailing="Optional value"
 * />
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
          className="text-[13px] md:text-[14px] truncate"
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
    "flex items-center justify-between gap-3 px-4 md:px-5 row-density",
    "transition-colors duration-150 group hover:bg-white/[0.02]",
    className
  );

  const baseStyle = { 
    borderBottom: '1px solid var(--platform-border)',
  };

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(baseClassName, "w-full text-left")}
        style={baseStyle}
      >
        {content}
      </button>
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
 * ADMIN METRIC ROW — Read-only count with subtle link
 * No action affordance. Link goes to detail view.
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
      className="flex items-center justify-between px-4 md:px-5 py-3 md:py-3.5 transition-colors duration-150 group hover:bg-white/[0.02]"
      style={{ 
        borderBottom: '1px solid var(--platform-border)',
      }}
    >
      <span 
        className="text-[13px] md:text-[14px] min-w-0 flex-1"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <span 
          className="text-[13px] md:text-[14px] font-medium tabular-nums"
          style={{ 
            color: highlight ? 'var(--platform-text)' : 'var(--platform-text-muted)'
          }}
        >
          {value}
        </span>
        <ChevronRight 
          className="h-3.5 w-3.5 opacity-30 group-hover:opacity-50 transition-opacity"
          style={{ color: 'var(--platform-text-muted)' }}
        />
      </div>
    </Link>
  );
}

/**
 * ADMIN SECTION — Sparse grouping with small caps label
 */
interface AdminSectionProps {
  label: string;
  children: React.ReactNode;
}

export function AdminSection({ label, children }: AdminSectionProps) {
  return (
    <section className="mb-8 md:mb-10">
      <h2 
        className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.1em] mb-3 md:mb-4"
        style={{ color: 'var(--platform-text-muted)', opacity: 0.7 }}
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
