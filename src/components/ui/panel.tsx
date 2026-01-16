import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL PANEL — DARK CANVAS (CANONICAL)
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Dark surface, hairline borders
 * - Flat, rectangular
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
        "rounded-md",
        className
      )}
      style={{
        backgroundColor: 'var(--platform-surface)',
        border: '1px solid var(--platform-border)'
      }}
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
        "px-4 py-3",
        className
      )}
      style={{ borderBottom: '1px solid var(--platform-border)' }}
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
        "text-[14px] font-medium",
        className
      )}
      style={{ color: 'var(--platform-text)' }}
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
 * INSTITUTIONAL DATA ROW — DARK CANVAS
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
      <dt 
        className="w-32 shrink-0 text-[13px]"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {label}
      </dt>
      <dd 
        className="text-[13px]"
        style={{ color: 'var(--platform-text)' }}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * INSTITUTIONAL DATA LIST — DARK CANVAS
 * 
 * Container for DataRow components.
 */
interface DataListProps {
  children: React.ReactNode;
  className?: string;
}

export function DataList({ children, className }: DataListProps) {
  return (
    <dl 
      className={cn("divide-y", className)}
      style={{ borderColor: 'var(--platform-border)' }}
    >
      {children}
    </dl>
  );
}

/**
 * INSTITUTIONAL STATUS ROW — DARK CANVAS (PREFERRED OVER STAT CARDS)
 * 
 * For inline status display. Text-first, not celebrated metrics.
 */
interface StatusRowProps {
  label: string;
  value: string | number;
  className?: string;
}

export function StatusRow({ label, value, className }: StatusRowProps) {
  return (
    <div 
      className={cn("flex items-center justify-between px-4 py-2.5", className)}
      style={{ borderColor: 'var(--platform-border)' }}
    >
      <span 
        className="text-[13px]"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {label}
      </span>
      <span 
        className="text-[13px] font-medium tabular-nums"
        style={{ color: 'var(--platform-text)' }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * INSTITUTIONAL STAT CARD — DARK CANVAS
 * 
 * NOTE: Prefer StatusRow for institutional density.
 * Only use StatCard when visual weight is specifically required.
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
        "rounded-md p-4",
        className
      )}
      style={{
        backgroundColor: 'var(--platform-surface)',
        border: '1px solid var(--platform-border)'
      }}
    >
      <p 
        className="text-[10px] font-medium tracking-[0.04em] uppercase"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        {label}
      </p>
      <p 
        className="mt-1 text-[20px] font-medium tabular-nums"
        style={{ color: 'var(--platform-text)' }}
      >
        {value}
      </p>
    </div>
  );
}
