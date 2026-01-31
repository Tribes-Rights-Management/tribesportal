import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP SECTION — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL SECTION CONTAINER (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent section wrapper with:
 * - Optional title and description
 * - Optional action slot
 * - Standardized spacing
 * 
 * USAGE:
 *   <AppSection
 *     title="Governance Overview"
 *     description="Review system status"
 *   >
 *     <AppStatCardGrid>...</AppStatCardGrid>
 *   </AppSection>
 * 
 * ENFORCEMENT:
 * - Use for grouping related content
 * - Provides consistent vertical rhythm
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Optional action slot */
  action?: React.ReactNode;
  /** Section content */
  children: React.ReactNode;
  /** Spacing variant */
  spacing?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

export function AppSection({
  title,
  description,
  action,
  children,
  spacing = "md",
  className,
}: AppSectionProps) {
  const spacingClasses = {
    sm: "mb-6",
    md: "mb-8",
    lg: "mb-12",
  };

  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[13px] text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * APP SECTION GRID — Layout helper for section content
 * 
 * Provides responsive grid layout for content.
 */
interface AppSectionGridProps {
  children: React.ReactNode;
  /** Number of columns on desktop */
  columns?: 1 | 2 | 3;
  /** Gap size */
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function AppSectionGrid({
  children,
  columns = 2,
  gap = "md",
  className,
}: AppSectionGridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div className={cn("grid items-stretch", colClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
}
