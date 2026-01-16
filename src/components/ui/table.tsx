import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL TABLE SYSTEM
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
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
          "w-full caption-bottom text-[14px]",
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
        "border-b border-[#E8E8E8]",
        className
      )} 
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
        "border-t border-[#E8E8E8] bg-[#FAFAFA] font-medium [&>tr]:last:border-b-0",
        className
      )} 
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
        "border-b border-[#F0F0F0] hover:bg-[#FAFAFA]",
        "data-[state=selected]:bg-[#F5F5F5]",
        className
      )}
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
        "text-[11px] font-medium tracking-[0.04em] uppercase text-[#6B6B6B]",
        "[&:has([role=checkbox])]:pr-0",
        className,
      )}
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
        "px-4 py-3 align-middle text-[14px] text-[#111]",
        "[&:has([role=checkbox])]:pr-0",
        className
      )} 
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
        "mt-4 text-[13px] text-[#6B6B6B]",
        className
      )} 
      {...props} 
    />
  ),
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
