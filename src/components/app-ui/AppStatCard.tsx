import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP STAT CARD — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL METRIC DISPLAY COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * For displaying key metrics/stats in a card format:
 * - Label (e.g., "Articles", "Active Users")
 * - Value (large number or text)
 * - Optional subtitle (e.g., "2 published, 1 draft")
 * - Optional click handler for navigation
 * 
 * USAGE:
 *   <AppStatCard
 *     label="Articles"
 *     value={42}
 *     subtitle="38 published, 4 draft"
 *     onClick={() => navigate("/articles")}
 *   />
 * 
 * ENFORCEMENT:
 * - All metric displays must use this component
 * - No hardcoded colors
 * ═══════════════════════════════════════════════════════════════════════════
 */

type StatCardSize = "sm" | "md" | "lg";

interface AppStatCardProps {
  /** Label above the value */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle below value */
  subtitle?: string;
  /** Size variant */
  size?: StatCardSize;
  /** Whether data is loading */
  loading?: boolean;
  /** Click handler (makes card interactive) */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

const sizeConfig: Record<StatCardSize, { padding: string; valueSize: string; labelSize: string }> = {
  sm: {
    padding: "p-4",
    valueSize: "text-[28px] font-extrabold tracking-[-0.03em] leading-none",
    labelSize: "text-[10px]",
  },
  md: {
    padding: "p-5",
    valueSize: "text-[32px] font-extrabold tracking-[-0.03em] leading-none",
    labelSize: "text-[10px]",
  },
  lg: {
    padding: "p-6",
    valueSize: "text-[36px] font-extrabold tracking-[-0.03em] leading-none",
    labelSize: "text-[10px]",
  },
};

export function AppStatCard({
  label,
  value,
  subtitle,
  size = "md",
  loading = false,
  onClick,
  className,
}: AppStatCardProps) {
  const isClickable = !!onClick;
  const config = sizeConfig[size];

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border/60 rounded-lg",
        config.padding,
        "transition-colors duration-150",
        isClickable && "cursor-pointer hover:bg-accent/40",
        className
      )}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === "Enter" && onClick?.() : undefined}
    >
      <p className={cn(config.labelSize, "uppercase tracking-[0.1em] font-medium text-[#9CA3AF] mb-3")}>
        {label}
      </p>
      <p className={cn(config.valueSize, "text-[#111827]")}>
        {loading ? "—" : value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * APP STAT CARD GRID — Layout helper for stat cards
 * 
 * Provides responsive grid layout for stat cards.
 * Default: 1 column mobile, 2 tablet, 4 desktop
 */
interface AppStatCardGridProps {
  children: React.ReactNode;
  /** Number of columns on desktop */
  columns?: 2 | 3 | 4;
  className?: string;
}

export function AppStatCardGrid({
  children,
  columns = 4,
  className,
}: AppStatCardGridProps) {
  const colClasses = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid grid-cols-1 gap-4", colClasses[columns], className)}>
      {children}
    </div>
  );
}
