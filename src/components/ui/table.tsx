import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL TABLE SYSTEM — DARK CANVAS (CANONICAL)
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Dark surface, hairline borders
 * - Flat, rectangular layout
 * - Minimal dividers
 * - No card-style rows
 * - No hover glow, lift, or animation
 * - Dense, optimized for scanning
 * - Headers: small, uppercase, muted
 * 
 * Tables should resemble internal financial systems, not consumer dashboards.
 */

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table 
        ref={ref} 
        className={cn(
          "w-full caption-bottom text-[13px]",
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
      style={{ borderColor: 'var(--platform-border)' }}
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
        borderColor: 'var(--platform-border)',
        backgroundColor: 'var(--platform-surface-2)'
      }}
      {...props} 
    />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        // Minimal divider, subtle hover - no animation, no lift
        // Height controlled by cell padding for 44px compact rows
        "border-b hover:bg-white/[0.02]",
        "data-[state=selected]:bg-white/[0.04]",
        "transition-colors duration-[150ms]",
        className
      )}
      style={{ borderColor: 'var(--platform-border)' }}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

/**
 * DATA DENSITY VARIANTS
 * compact = 44px rows, minimal padding (default for institutional)
 * standard = 48px rows, comfortable padding
 */
type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean; // Right-align numeric columns
};

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, numeric, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        // Institutional header: small, uppercase, muted, compact
        "h-11 px-4 align-middle",
        "text-[10px] font-medium tracking-[0.04em] uppercase",
        numeric ? "text-right" : "text-left",
        "[&:has([role=checkbox])]:pr-0",
        className,
      )}
      style={{ color: 'var(--platform-text-muted)' }}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean; // Right-align numeric values
  muted?: boolean;   // Secondary/meta styling
};

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, numeric, muted, ...props }, ref) => (
    <td 
      ref={ref} 
      className={cn(
        // Compact, ledger-like cell (44px effective row height)
        "px-4 py-2.5 align-middle text-[13px]",
        numeric && "text-right tabular-nums font-medium",
        muted && "text-[12px]",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      style={{ color: muted ? 'var(--platform-text-muted)' : 'var(--platform-text)' }}
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
        "mt-4 text-[12px]",
        className
      )}
      style={{ color: 'var(--platform-text-secondary)' }}
      {...props} 
    />
  ),
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
