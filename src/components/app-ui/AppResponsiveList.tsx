import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * APP RESPONSIVE LIST — GLOBAL UI KIT
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * RESPONSIVE TABLE/CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Automatically switches between:
 * - Desktop (md+): Table view with columns
 * - Mobile (<md): Stacked card view
 * 
 * USAGE:
 *   <AppResponsiveList
 *     items={songs}
 *     renderCard={(song) => <SongCard song={song} />}
 *     renderTable={() => <SongTable songs={songs} />}
 *   />
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppResponsiveListProps<T> {
  /** Items to display */
  items: T[];
  /** Render function for mobile card view */
  renderCard: (item: T, index: number) => React.ReactNode;
  /** Render function for desktop table view */
  renderTable: () => React.ReactNode;
  /** Key extractor for items */
  keyExtractor: (item: T) => string;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional className for container */
  className?: string;
}

export function AppResponsiveList<T>({
  items,
  renderCard,
  renderTable,
  keyExtractor,
  emptyMessage = "No items available",
  className,
}: AppResponsiveListProps<T>) {
  const isMobile = useIsMobile();

  if (items.length === 0) {
    return (
      <div className={cn("py-12 text-center", className)}>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Mobile: Card view */}
      <div className="md:hidden space-y-3">
        {items.map((item, index) => (
          <div key={keyExtractor(item)}>
            {renderCard(item, index)}
          </div>
        ))}
      </div>

      {/* Desktop: Table view */}
      <div className="hidden md:block">
        {renderTable()}
      </div>
    </div>
  );
}

/**
 * APP ITEM CARD — Mobile card for list items
 * 
 * Standardized mobile card with:
 * - Title (bold, primary)
 * - Subtitle (secondary)
 * - Metadata line (small, muted)
 * - Optional status chip
 * - Click handler
 */
interface AppItemCardProps {
  /** Primary title */
  title: string;
  /** Secondary subtitle */
  subtitle?: string;
  /** Additional metadata (ISWC, date, etc.) */
  meta?: React.ReactNode;
  /** Status chip or badge */
  status?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

export function AppItemCard({
  title,
  subtitle,
  meta,
  status,
  onClick,
  className,
}: AppItemCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border/60 rounded-lg p-4",
        "transition-colors duration-150",
        onClick && "cursor-pointer hover:bg-accent/30 active:bg-accent/50",
        className
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-[13px] text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
          {meta && (
            <div className="text-xs text-muted-foreground/70 pt-1">
              {meta}
            </div>
          )}
        </div>
        {status && (
          <div className="shrink-0">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
