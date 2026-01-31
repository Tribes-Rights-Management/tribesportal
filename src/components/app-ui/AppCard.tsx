import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP CARD — CONSOLE LIGHT (Stripe-like)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * INSTITUTIONAL SURFACE COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - Background: White (--app-surface-bg)
 * - Border: Subtle (--app-surface-border)
 * - Radius: 10-12px (Stripe restraint)
 * - Shadow: None or extremely subtle
 * - Consistent padding across all cards
 * 
 * ENFORCEMENT:
 * - Import from @/components/app-ui
 * - Do NOT use Card from @/components/ui/card directly
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
  return (
    <div
      className={cn(
        "rounded-lg",
        transparent 
          ? "bg-transparent" 
          : "bg-[var(--app-surface-bg)] border border-[var(--app-surface-border)]/60",
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
        "flex items-center justify-between gap-3",
        "px-4 py-3 border-b border-[var(--app-surface-border)]/60",
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
        "text-sm font-medium text-foreground",
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
      className={cn("text-xs text-muted-foreground mt-0.5", className)}
      {...props}
    />
  );
}

export function AppCardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-3", className)} {...props} />;
}

export function AppCardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2",
        "px-4 py-3 border-t border-[var(--app-surface-border)]/60",
        className
      )}
      {...props}
    />
  );
}
