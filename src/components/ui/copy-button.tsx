import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COPY BUTTON — CANONICAL CLIPBOARD COPY COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent, quiet copy button for values like emails, IDs, etc.
 * Stripe/Mercury-grade styling: small icon, low contrast until hover.
 * 
 * SIZING (Stripe/Mercury scale):
 * - Icon: 12px (h-3 w-3) — subtle, professional
 * - Tap target: 32px mobile, 28px desktop (accessible but quiet)
 * 
 * BEHAVIOR:
 * - Shows checkmark on success (2s)
 * - Toast notification "Copied"
 * - Graceful error handling
 * 
 * Usage:
 * <CopyButton value="user@example.com" />
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface CopyButtonProps {
  /** The value to copy to clipboard */
  value: string;
  /** Optional className */
  className?: string;
  /** Size variant */
  size?: "sm" | "md";
  /** Custom aria-label */
  label?: string;
  /** Stop event propagation (useful in clickable rows) */
  stopPropagation?: boolean;
}

export function CopyButton({
  value,
  className,
  size = "sm",
  label = "Copy to clipboard",
  stopPropagation = true,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ description: "Copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ description: "Failed to copy", variant: "destructive" });
    }
  };

  // Stripe/Mercury-grade sizing: subtle, professional
  const sizeClasses = {
    sm: "h-7 w-7 sm:h-6 sm:w-6",
    md: "h-9 w-9 sm:h-8 sm:w-8",
  };

  // Icon size: 12px for sm, 14px for md
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "shrink-0 rounded flex items-center justify-center",
        "transition-colors",
        sizeClasses[size],
        className
      )}
      style={{ color: 'var(--platform-text-muted)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.color = 'var(--platform-text-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--platform-text-muted)';
      }}
      aria-label={label}
    >
      {copied ? (
        <Check className={cn(iconSize)} style={{ color: '#4ade80' }} />
      ) : (
        <Copy className={cn(iconSize)} />
      )}
    </button>
  );
}

/**
 * COPYABLE VALUE — Value with inline copy button
 * 
 * For use in lists and detail rows where you need a value + copy button.
 * Truncates long values with ellipsis.
 */
interface CopyableValueProps {
  /** The value to display and copy */
  value: string;
  /** Optional className for the container */
  className?: string;
  /** Whether to truncate the value */
  truncate?: boolean;
  /** Optional append content (like "(you)") */
  append?: React.ReactNode;
}

export function CopyableValue({
  value,
  className,
  truncate = true,
  append,
}: CopyableValueProps) {
  return (
    <div className={cn("flex items-center gap-1 min-w-0", className)}>
      <span 
        className={cn(
          "text-[14px] min-w-0",
          truncate && "truncate"
        )}
        style={{ color: 'var(--platform-text)' }}
        title={value}
      >
        {value}
        {append}
      </span>
      <CopyButton value={value} size="sm" />
    </div>
  );
}