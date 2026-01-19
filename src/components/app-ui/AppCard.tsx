import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP CARD — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * INSTITUTIONAL SURFACE COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - Background: --card token (elevated surface)
 * - Border: --border token (subtle separator)
 * - Radius: --surface-radius (16px) or --surface-radius-sm (12px)
 * - Consistent padding across all cards
 * 
 * ENFORCEMENT:
 * - Import from @/components/app-ui
 * - Do NOT use Card from @/components/ui/card directly for new development
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to use transparent background */
  transparent?: boolean;
}

export function AppCard({
  className,
  size = "md",
  transparent = false,
  children,
  ...props
}: AppCardProps) {
  const sizeClasses = {
    sm: "rounded-[var(--surface-radius-sm)]",
    md: "rounded-[var(--surface-radius)]",
    lg: "rounded-[var(--surface-radius)]",
  };

  return (
    <div
      className={cn(
        "border",
        sizeClasses[size],
        transparent ? "bg-transparent" : "bg-card",
        "border-[hsl(var(--border-hsl))]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface AppCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional action slot for buttons */
  action?: React.ReactNode;
}

export function AppCardHeader({
  className,
  action,
  children,
  ...props
}: AppCardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        "px-5 py-4 border-b border-[hsl(var(--border-hsl))]",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function AppCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[15px] font-semibold text-foreground tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function AppCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[13px] text-muted-foreground mt-0.5", className)}
      {...props}
    />
  );
}

export function AppCardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function AppCardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3",
        "px-5 py-4 border-t border-[hsl(var(--border-hsl))]",
        className
      )}
      {...props}
    />
  );
}
