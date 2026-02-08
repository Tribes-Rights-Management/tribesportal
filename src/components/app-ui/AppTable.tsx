import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

/**
 * APP TABLE — CONSOLE LIGHT (Stripe-like)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL TABLE COMPONENTS (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent table styling with:
 * - White surface with subtle border
 * - Subtle header (no heavy background)
 * - Light row hover (muted/30)
 * - Consistent density across all tables
 * - BALANCED COLUMN WIDTHS via columns prop
 * 
 * ENFORCEMENT:
 * - All data tables must use these components
 * - No hardcoded table styling
 * - Use columns prop for consistent proportions
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN WIDTH PRESETS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Predefined column width patterns for common table layouts.
 * Use these to ensure consistent proportions across tables.
 */
export const TABLE_COLUMN_PRESETS = {
  // 4-column layouts (most common)
  "name-meta-status-date": ["35%", "35%", "15%", "15%"],      // Categories, Articles with audiences
  "name-slug-meta-date": ["25%", "25%", "30%", "20%"],        // Categories with slug
  "title-status-date": ["60%", "20%", "20%"],                  // Simple 3-column
  "name-description-date": ["30%", "50%", "20%"],             // With description
  
  // 5-column layouts
  "name-slug-meta-status-date": ["20%", "20%", "30%", "15%", "15%"],
  
  // Equal distribution helpers
  "equal-2": ["50%", "50%"],
  "equal-3": ["33.33%", "33.33%", "33.33%"],
  "equal-4": ["25%", "25%", "25%", "25%"],
  "equal-5": ["20%", "20%", "20%", "20%", "20%"],
} as const;

export type ColumnPreset = keyof typeof TABLE_COLUMN_PRESETS;

// ─────────────────────────────────────────────────────────────────────────────
// TABLE CONTAINER
// ─────────────────────────────────────────────────────────────────────────────

interface AppTableProps {
  children: React.ReactNode;
  /** 
   * Column widths - can be:
   * - A preset name: "name-meta-status-date"
   * - An array of widths: ["35%", "35%", "15%", "15%"]
   */
  columns?: ColumnPreset | string[];
  className?: string;
}

export function AppTable({ children, columns, className }: AppTableProps) {
  // Resolve column widths from preset or direct array
  const columnWidths = columns
    ? typeof columns === "string"
      ? TABLE_COLUMN_PRESETS[columns]
      : columns
    : undefined;

  return (
    <div
      className={cn(
        "bg-[var(--app-surface-bg)] border border-[var(--app-surface-border)]",
        "rounded-[var(--app-radius)] overflow-hidden",
        className
      )}
    >
      {/* Horizontal scroll wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          {columnWidths && (
            <colgroup>
              {columnWidths.map((width, i) => (
                <col key={i} style={{ width }} />
              ))}
            </colgroup>
          )}
          {children}
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE HEADER
// ─────────────────────────────────────────────────────────────────────────────

interface AppTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AppTableHeader({ children, className }: AppTableHeaderProps) {
  return (
    <thead className={cn("bg-muted/30", className)}>
      {children}
    </thead>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE BODY
// ─────────────────────────────────────────────────────────────────────────────

interface AppTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function AppTableBody({ children, className }: AppTableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE ROW
// ─────────────────────────────────────────────────────────────────────────────

interface AppTableRowProps {
  children: React.ReactNode;
  /** Makes row clickable with hover state */
  clickable?: boolean;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLTableRowElement>) => void;
  /** Double click handler */
  onDoubleClick?: () => void;
  /** Header row styling */
  header?: boolean;
  className?: string;
}

export function AppTableRow({
  children,
  clickable = false,
  onClick,
  onDoubleClick,
  header = false,
  className,
}: AppTableRowProps) {
  return (
    <tr
      onClick={clickable ? onClick : undefined}
      onDoubleClick={clickable ? onDoubleClick : undefined}
      className={cn(
        header 
          ? "border-b border-[var(--app-surface-border)]" 
          : "border-b border-[var(--app-surface-border)]/50",
        clickable && "cursor-pointer hover:bg-muted/30 transition-colors",
        className
      )}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter") onClick?.(e as any);
            }
          : undefined
      }
    >
      {children}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE HEAD (Header Cell)
// ─────────────────────────────────────────────────────────────────────────────

type SortDirection = "asc" | "desc" | null;

interface AppTableHeadProps {
  children?: React.ReactNode;
  /** Enable sorting */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort handler */
  onSort?: () => void;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Width (use columns prop on AppTable instead for consistency) */
  width?: string;
  className?: string;
}

export function AppTableHead({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  align = "left",
  width,
  className,
}: AppTableHeadProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const SortIcon = () => {
    if (!sortable) return null;
    if (sortDirection === "asc") {
      return <ArrowUp className="h-3.5 w-3.5 ml-1 text-muted-foreground" strokeWidth={1.25} />;
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" strokeWidth={1.25} />;
    }
    return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40 text-muted-foreground" strokeWidth={1.25} />;
  };

  const content = (
    <>
      {children}
      <SortIcon />
    </>
  );

  return (
    <th
      className={cn(
        "py-[14px] px-4",
        "text-xs uppercase tracking-wider font-medium text-muted-foreground",
        alignClasses[align],
        className
      )}
      style={{ width }}
    >
      {sortable ? (
        <button
          onClick={onSort}
          className={cn(
            "flex items-center hover:text-foreground transition-colors uppercase",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
            align === "right" && "ml-auto"
          )}
        >
          {content}
        </button>
      ) : (
        content
      )}
    </th>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE CELL
// ─────────────────────────────────────────────────────────────────────────────

interface AppTableCellProps {
  children: React.ReactNode;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Muted text color */
  muted?: boolean;
  /** Monospace font (for slugs, codes, etc.) */
  mono?: boolean;
  className?: string;
}

export function AppTableCell({
  children,
  align = "left",
  muted = false,
  mono = false,
  className,
}: AppTableCellProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <td
      className={cn(
        "py-[14px] px-4 text-sm",
        muted ? "text-muted-foreground" : "text-foreground",
        mono && "font-mono text-[13px]",
        alignClasses[align],
        className
      )}
    >
      {children}
    </td>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

interface AppTableEmptyProps {
  /** Number of columns to span */
  colSpan: number;
  /** Empty state content */
  children: React.ReactNode;
  className?: string;
}

export function AppTableEmpty({ colSpan, children, className }: AppTableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn("text-center py-16", className)}>
        {children}
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE (for table cells)
// ─────────────────────────────────────────────────────────────────────────────

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

interface AppTableBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  error: "bg-destructive/20 text-destructive",
  info: "bg-info/20 text-info",
};

export function AppTableBadge({
  children,
  variant = "default",
  className,
}: AppTableBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAG (for small inline labels)
// ─────────────────────────────────────────────────────────────────────────────

interface AppTableTagProps {
  children: React.ReactNode;
  className?: string;
}

export function AppTableTag({ children, className }: AppTableTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded",
        "text-[11px] bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
