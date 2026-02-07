import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL TABLE SYSTEM — FUNDRISE/MERCURY CLASS (CANONICAL)
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Tables sit directly on page surface (NO card wrapping)
 * - Horizontal dividers only (no boxed cells)
 * - No zebra striping
 * - No shadows, no motion on hover
 * - Dense, archival, reviewable
 * 
 * ROW DENSITY:
 * - Default: 48px row height
 * - Compact: 40px (admin-only, future toggle)
 * - Never exceed 56px
 * 
 * COLUMN SPACING:
 * - Left/right padding: 20px
 * - Numeric columns: right-aligned
 * - Status columns: center-aligned
 * 
 * TYPOGRAPHY:
 * - Header: 12px, uppercase, +0.04em tracking, muted
 * - Body: 14px, normal weight, near-black (on dark: off-white)
 */

type TableDensity = "default" | "compact";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  density?: TableDensity;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, density = "default", ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table 
        ref={ref} 
        data-density={density}
        className={cn(
          "w-full caption-bottom",
          density === "compact" ? "text-[12px]" : "text-[13px]",
          className
        )}
        {...props} 
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead 
      ref={ref} 
      className={cn(
        "border-b",
        className
      )}
      style={{ 
        borderColor: 'var(--border-subtle)',
        backgroundColor: 'var(--card-bg)'
      }}
      {...props} 
    />
  ),
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody 
      ref={ref} 
      className={cn("[&_tr:last-child]:border-0", className)} 
      {...props} 
    />
  ),
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot 
      ref={ref} 
      className={cn(
        "border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      style={{ 
        borderColor: 'var(--border-subtle)',
        backgroundColor: 'var(--tribes-surface-elevated)'
      }}
      {...props} 
    />
  ),
);
TableFooter.displayName = "TableFooter";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Make entire row clickable */
  clickable?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, clickable, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        // Horizontal divider only, subtle hover tint
        // NO shadows, NO motion, NO lift
        "border-b transition-colors duration-150",
        clickable && "hover:bg-[var(--tribes-nav-hover)] cursor-pointer",
        className
      )}
      style={{ 
        borderColor: 'var(--border-subtle)',
      }}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  /** Right-align numeric columns */
  numeric?: boolean;
  /** Center-align status columns */
  status?: boolean;
};

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, numeric, status, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        // Institutional header: 11px, uppercase, +0.04em tracking, muted
        // Explicit py padding for consistent 14px vertical spacing
        "px-4 py-3.5 align-middle",
        "text-[11px] font-medium tracking-wider uppercase",
        numeric && "text-right",
        status && "text-center",
        !numeric && !status && "text-left",
        "[&:has([role=checkbox])]:pr-0",
        className,
      )}
      style={{ color: 'var(--tribes-fg-muted)' }}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  /** Right-align numeric values */
  numeric?: boolean;
  /** Center-align status values */
  status?: boolean;
  /** Secondary/meta styling */
  muted?: boolean;
};

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, numeric, status, muted, ...props }, ref) => (
    <td 
      ref={ref} 
      className={cn(
        // Standard row padding: 14px vertical for ~47-57px rows
        "px-4 py-3.5 align-middle text-[13px]",
        numeric && "text-right tabular-nums font-medium",
        status && "text-center",
        muted && "text-[12px]",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      style={{ color: muted ? 'var(--tribes-fg-muted)' : 'var(--tribes-fg)' }}
      {...props} 
    />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption 
      ref={ref} 
      className={cn(
        "mt-4 text-[13px]",
        className
      )}
      style={{ color: 'var(--tribes-fg-secondary)' }}
      {...props} 
    />
  ),
);
TableCaption.displayName = "TableCaption";

/**
 * EMPTY TABLE ROW — Institutional empty state
 * Uses standardized language, no illustrations, no "helpful" tips
 */
interface TableEmptyRowProps {
  colSpan: number;
  title: string;
  description?: string;
}

const TableEmptyRow = React.forwardRef<HTMLTableRowElement, TableEmptyRowProps>(
  ({ colSpan, title, description }, ref) => (
    <tr ref={ref}>
      <td 
        colSpan={colSpan} 
        className="px-5 py-10 text-center"
      >
        <p 
          className="text-[14px] font-medium"
          style={{ color: 'var(--tribes-fg-secondary)' }}
        >
          {title}
        </p>
        {description && (
          <p 
            className="text-[13px] mt-1"
            style={{ color: 'var(--tribes-fg-muted)' }}
          >
            {description}
          </p>
        )}
      </td>
    </tr>
  ),
);
TableEmptyRow.displayName = "TableEmptyRow";

export { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption,
  TableEmptyRow,
};
