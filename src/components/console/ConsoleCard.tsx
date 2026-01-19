import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * CONSOLE CARD — SYSTEM CONSOLE COMPONENT KIT
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * ELEVATED SURFACE CONTAINER (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - Background: elevated dark surface
 * - Border: subtle 1px border
 * - Radius: 12px (consistent with controls)
 * - Padding: 16-20px standard
 * 
 * SUBCOMPONENTS:
 * - ConsoleCardHeader: Title + description area
 * - ConsoleCardBody: Main content area
 * - ConsoleCardFooter: Actions or metadata
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============ CONSOLE CARD ROOT ============
interface ConsoleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: "default" | "elevated" | "muted";
}

export function ConsoleCard({
  className,
  variant = "default",
  ...props
}: ConsoleCardProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: "var(--console-card-bg)",
      border: "1px solid var(--console-card-border)",
    },
    elevated: {
      backgroundColor: "var(--console-elevated-bg)",
      border: "1px solid var(--console-elevated-border)",
    },
    muted: {
      backgroundColor: "var(--console-card-bg)",
      border: "1px dashed var(--console-card-border)",
      opacity: 0.7,
    },
  };

  return (
    <div
      className={cn(
        "rounded-[var(--console-control-radius)] overflow-hidden",
        className
      )}
      style={variantStyles[variant]}
      {...props}
    />
  );
}

// ============ CONSOLE CARD HEADER ============
interface ConsoleCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional title */
  title?: string;
  /** Optional description/subtitle */
  description?: string;
  /** Right-side actions slot */
  actions?: React.ReactNode;
}

export function ConsoleCardHeader({
  className,
  title,
  description,
  actions,
  children,
  ...props
}: ConsoleCardHeaderProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 sm:px-5 sm:py-4",
        "border-b",
        className
      )}
      style={{ borderColor: "var(--console-card-border)" }}
      {...props}
    >
      {(title || description || actions) ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {title && (
              <h3
                className="text-[14px] font-medium leading-tight"
                style={{ color: "var(--console-fg)" }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                className="text-[12px] mt-0.5 leading-snug"
                style={{ color: "var(--console-fg-muted)" }}
              >
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ============ CONSOLE CARD BODY ============
interface ConsoleCardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Remove default padding */
  noPadding?: boolean;
}

export function ConsoleCardBody({
  className,
  noPadding = false,
  ...props
}: ConsoleCardBodyProps) {
  return (
    <div
      className={cn(
        !noPadding && "px-4 py-3 sm:px-5 sm:py-4",
        className
      )}
      {...props}
    />
  );
}

// ============ CONSOLE CARD FOOTER ============
interface ConsoleCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ConsoleCardFooter({
  className,
  ...props
}: ConsoleCardFooterProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 sm:px-5 sm:py-4",
        "border-t",
        className
      )}
      style={{ borderColor: "var(--console-card-border)" }}
      {...props}
    />
  );
}
