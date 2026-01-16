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
        "border-b hover:bg-white/[0.02]",
        "data-[state=selected]:bg-white/[0.04]",
        className
      )}
      style={{ borderColor: 'var(--platform-border)' }}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        // Institutional header: small, uppercase, muted, dense
        "h-10 px-4 text-left align-middle",
        "text-[10px] font-medium tracking-[0.04em] uppercase",
        "[&:has([role=checkbox])]:pr-0",
        className,
      )}
      style={{ color: 'var(--platform-text-muted)' }}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td 
      ref={ref} 
      className={cn(
        // Dense, readable cell
        "px-4 py-3 align-middle text-[13px]",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      style={{ color: 'var(--platform-text)' }}
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
