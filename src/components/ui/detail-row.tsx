import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

/**
 * DETAIL ROW — Universal Key/Value Display Component
 * 
 * Mobile-first: stacked layout on mobile, side-by-side on desktop.
 * Supports variants: text, status (pill), role (pill + help), link.
 * Optional copyable button for long values like emails.
 */

export type DetailRowVariant = "text" | "status" | "role" | "link";

interface DetailRowProps {
  /** Label displayed on the left (desktop) or top (mobile) */
  label: string;
  /** Value to display */
  value: string | null | undefined;
  /** Visual variant */
  variant?: DetailRowVariant;
  /** Show copy button for the value */
  copyable?: boolean;
  /** Optional help text displayed below the value */
  helpText?: string;
  /** Max lines before truncation (default: 1) */
  maxLines?: 1 | 2;
  /** Status color for status variant */
  statusColor?: "active" | "pending" | "suspended" | "revoked" | "denied" | "default";
  /** Custom className */
  className?: string;
  /** Append content like "(you)" indicator */
  append?: React.ReactNode;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80" },
  pending: { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15" },
  suspended: { bg: "rgba(249, 115, 22, 0.15)", text: "#fb923c" },
  revoked: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" },
  denied: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" },
  default: { bg: "rgba(255,255,255,0.06)", text: "var(--platform-text)" },
};

export function DetailRow({
  label,
  value,
  variant = "text",
  copyable = false,
  helpText,
  maxLines = 1,
  statusColor = "default",
  className,
  append,
}: DetailRowProps) {
  const [copied, setCopied] = React.useState(false);

  const displayValue = value || "—";
  const hasValue = value !== null && value !== undefined && value !== "";

  const handleCopy = async () => {
    if (!hasValue) return;
    
    try {
      await navigator.clipboard.writeText(value!);
      setCopied(true);
      toast({
        description: "Copied",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        description: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const renderValue = () => {
    switch (variant) {
      case "status":
        const sColors = statusColors[statusColor] || statusColors.default;
        return (
          <div 
            className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium"
            style={{ 
              backgroundColor: sColors.bg,
              color: sColors.text,
            }}
          >
            {displayValue}
          </div>
        );
      
      case "role":
        return (
          <div 
            className="inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-medium"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: 'var(--platform-text)',
            }}
          >
            {displayValue}
          </div>
        );
      
      case "link":
        return (
          <a
            href={value || "#"}
            className="text-[13px] underline-offset-2 hover:underline"
            style={{ color: 'var(--platform-text)' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {displayValue}
          </a>
        );
      
      case "text":
      default:
        return (
          <span 
            className={cn(
              "text-[13px]",
              maxLines === 1 ? "truncate" : "line-clamp-2",
            )}
            style={{ 
              color: 'var(--platform-text)', 
              lineHeight: '1.45',
            }}
            title={hasValue ? value : undefined}
          >
            {displayValue}
            {append}
          </span>
        );
    }
  };

  return (
    <div 
      className={cn(
        // Mobile: stacked layout
        "flex flex-col gap-1.5 px-4 py-3 sm:px-6",
        // Desktop (sm+): side-by-side
        "sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className
      )}
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      {/* Label */}
      <dt 
        className="text-[13px] shrink-0 sm:text-[12px]"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {label}
      </dt>
      
      {/* Value container */}
      <dd className="min-w-0 flex-1 sm:text-right">
        <div className="flex items-center gap-2 sm:justify-end">
          {/* Value itself */}
          <div className={cn(
            "min-w-0 flex-1 sm:flex-initial",
            variant === "text" && maxLines === 1 && "truncate"
          )}>
            {renderValue()}
          </div>
          
          {/* Copy button */}
          {copyable && hasValue && (
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 p-1.5 rounded transition-colors hover:bg-white/[0.06]"
              style={{ color: 'var(--platform-text-muted)' }}
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" style={{ color: 'rgb(var(--success, 74 222 128))' }} />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
        
        {/* Help text */}
        {helpText && (
          <p 
            className="text-[11px] mt-1 sm:text-right"
            style={{ color: 'var(--platform-text-muted)', lineHeight: '1.45' }}
          >
            {helpText}
          </p>
        )}
      </dd>
    </div>
  );
}

/**
 * Container for DetailRow items
 */
export function DetailRowGroup({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-transparent", className)}>
      {children}
    </dl>
  );
}
