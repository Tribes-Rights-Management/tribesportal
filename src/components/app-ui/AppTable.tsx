import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

/**
 * APP TABLE — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL TABLE COMPONENTS (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent table styling with:
 * - Themed backgrounds and borders
 * - Sortable column headers
 * - Hover states for rows
 * - Empty state support
 * 
 * USAGE:
 *   <AppTable>
 *     <AppTableHeader>
 *       <AppTableRow>
 *         <AppTableHead sortable onSort={handleSort}>Title</AppTableHead>
 *         <AppTableHead>Status</AppTableHead>
 *       </AppTableRow>
 *     </AppTableHeader>
 *     <AppTableBody>
 *       <AppTableRow clickable onClick={handleClick}>
 *         <AppTableCell>Article Title</AppTableCell>
 *         <AppTableCell>Published</AppTableCell>
 *       </AppTableRow>
 *     </AppTableBody>
 *   </AppTable>
 * 
 * ENFORCEMENT:
 * - All data tables must use these components
 * - No hardcoded table styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TABLE CONTAINER
// ─────────────────────────────────────────────────────────────────────────────

interface AppTableProps {
  children: React.ReactNode;
  className?: string;
}

export function AppTable({ children, className }: AppTableProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-[var(--surface-radius-sm)]",
        "overflow-hidden",
        className
      )}
    >
      <table className="w-full">{children}</table>
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
  return <thead className={className}>{children}</thead>;
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
  onClick?: () => void;
  /** Header row styling */
  header?: boolean;
  className?: string;
}

export function AppTableRow({
  children,
  clickable = false,
  onClick,
  header = false,
  className,
}: AppTableRowProps) {
  return (
    <tr
      onClick={clickable ? onClick : undefined}
      className={cn(
        header ? "border-b border-border" : "border-b border-border/50",
        clickable && "cursor-pointer hover:bg-accent/50 transition-colors",
        className
      )}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter") onClick?.();
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
  children: React.ReactNode;
  /** Enable sorting */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort handler */
  onSort?: () => void;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Width */
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
        "py-3 px-4",
        "text-[10px] uppercase tracking-wider font-medium text-muted-foreground",
        alignClasses[align],
        className
      )}
      style={{ width }}
    >
      {sortable ? (
        <button
          onClick={onSort}
          className={cn(
            "flex items-center hover:text-foreground transition-colors",
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
  className?: string;
}

export function AppTableCell({
  children,
  align = "left",
  muted = false,
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
        "py-3 px-4 text-[13px]",
        muted ? "text-muted-foreground" : "text-foreground",
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
        "inline-flex items-center px-2 py-1 rounded text-[11px] font-medium",
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
        "text-[10px] bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
