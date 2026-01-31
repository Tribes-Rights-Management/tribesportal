import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

/**
 * APP LIST CARD — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL LIST CONTAINER COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Card container for lists with:
 * - Optional header with title and action
 * - Consistent border and background
 * - Works with AppListRow for items
 * 
 * USAGE:
 *   <AppListCard
 *     title="Recent Articles"
 *     action={<button>View all</button>}
 *   >
 *     <AppListRow title="Article 1" subtitle="Jan 1" />
 *     <AppListRow title="Article 2" subtitle="Jan 2" />
 *   </AppListCard>
 * 
 * ENFORCEMENT:
 * - All list displays must use this component
 * - No hardcoded card styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppListCardProps {
  /** Optional header title */
  title?: string;
  /** Optional header action (button, link, etc.) */
  action?: React.ReactNode;
  /** List content (AppListRow components) */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function AppListCard({
  title,
  action,
  children,
  className,
}: AppListCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-[var(--surface-radius)]",
        "overflow-hidden flex flex-col",
        className
      )}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4 shrink-0">
          {title && (
            <h3 className="text-[14px] font-semibold text-foreground">
              {title}
            </h3>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="divide-y divide-border/50 flex-1">
        {children}
      </div>
    </div>
  );
}

/**
 * APP LIST ROW — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL LIST ITEM COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Individual row in a list with:
 * - Title (required)
 * - Optional subtitle
 * - Optional left icon/element
 * - Optional right value/badge
 * - Optional chevron for drill-down
 * - Click handler for navigation
 * 
 * USAGE:
 *   <AppListRow
 *     title="Active workspaces"
 *     value="2"
 *     onClick={() => navigate("/workspaces")}
 *     showChevron
 *   />
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppListRowProps {
  /** Main title text */
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Optional left element (icon, avatar, etc.) */
  left?: React.ReactNode;
  /** Optional right value or element */
  value?: React.ReactNode;
  /** Show chevron indicator */
  showChevron?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

export function AppListRow({
  title,
  subtitle,
  left,
  value,
  showChevron = false,
  onClick,
  className,
}: AppListRowProps) {
  const isClickable = !!onClick;
  const showRightChevron = showChevron || isClickable;

  return (
    <div
      onClick={onClick}
      className={cn(
        "px-5 py-4 flex items-center gap-4",
        "transition-colors duration-150",
        isClickable && "cursor-pointer hover:bg-accent/50",
        className
      )}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === "Enter" && onClick?.() : undefined}
    >
      {left && <div className="shrink-0">{left}</div>}
      
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-foreground truncate">
          {title}
        </p>
        {subtitle && (
          <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {value && (
        <div className="shrink-0 text-[14px] text-muted-foreground">
          {value}
        </div>
      )}

      {showRightChevron && (
        <ChevronRight 
          className="h-4 w-4 text-muted-foreground/50 shrink-0" 
          strokeWidth={1.5} 
        />
      )}
    </div>
  );
}

/**
 * APP LIST ACTION — Link-style action for list headers
 */
interface AppListActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AppListAction({
  children,
  onClick,
  className,
}: AppListActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[12px] text-muted-foreground hover:text-foreground",
        "flex items-center gap-1 transition-colors duration-150",
        className
      )}
    >
      {children}
      <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
    </button>
  );
}
