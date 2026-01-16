import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL PANEL
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Flat, rectangular
 * - Minimal border
 * - No card-style shadows or lift
 * - Dense padding
 * 
 * Use for data panels, record displays, and content sections.
 */

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return (
    <div 
      className={cn(
        "bg-white border border-[#E8E8E8] rounded-md",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PanelHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelHeader({ children, className }: PanelHeaderProps) {
  return (
    <div 
      className={cn(
        "px-4 py-3 border-b border-[#E8E8E8]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PanelTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelTitle({ children, className }: PanelTitleProps) {
  return (
    <h3 
      className={cn(
        "text-[14px] font-medium text-[#111]",
        className
      )}
    >
      {children}
    </h3>
  );
}

interface PanelContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelContent({ children, className }: PanelContentProps) {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  );
}

/**
 * INSTITUTIONAL DATA ROW
 * 
 * For displaying key-value pairs in record views.
 * Flat, dense, audit-ready presentation.
 */
interface DataRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function DataRow({ label, value, className }: DataRowProps) {
  return (
    <div className={cn("flex items-start gap-4 py-2", className)}>
      <dt className="w-32 shrink-0 text-[13px] text-[#6B6B6B]">
        {label}
      </dt>
      <dd className="text-[14px] text-[#111]">
        {value}
      </dd>
    </div>
  );
}

/**
 * INSTITUTIONAL DATA LIST
 * 
 * Container for DataRow components.
 */
interface DataListProps {
  children: React.ReactNode;
  className?: string;
}

export function DataList({ children, className }: DataListProps) {
  return (
    <dl className={cn("divide-y divide-[#F0F0F0]", className)}>
      {children}
    </dl>
  );
}

/**
 * INSTITUTIONAL STAT CARD
 * 
 * For dashboard metrics. Dense, functional, no decoration.
 */
interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
}

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div 
      className={cn(
        "bg-white border border-[#E8E8E8] rounded-md p-4",
        className
      )}
    >
      <p className="text-[11px] font-medium tracking-[0.04em] uppercase text-[#6B6B6B]">
        {label}
      </p>
      <p className="mt-1 text-[24px] font-medium text-[#111] tabular-nums">
        {value}
      </p>
    </div>
  );
}
