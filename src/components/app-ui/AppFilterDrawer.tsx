import * as React from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AppButton } from "./AppButton";
import { ICON_SIZE, ICON_STROKE } from "@/styles/tokens";

/**
 * APP FILTER DRAWER — GLOBAL UI KIT (LOCKED)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * INSTITUTIONAL FILTER PANEL FOR DATA LIST PAGES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Replaces inline search with a slide-out filter drawer pattern.
 * Shows filter indicator when filters are active.
 * 
 * USAGE:
 *   <AppFilterDrawer
 *     open={filterOpen}
 *     onOpenChange={setFilterOpen}
 *     hasActiveFilters={hasFilters}
 *   >
 *     <AppFilterSection title="Status">
 *       ...filter controls
 *     </AppFilterSection>
 *   </AppFilterDrawer>
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppFilterDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Drawer content (filter sections) */
  children: React.ReactNode;
  /** Whether any filters are currently active */
  hasActiveFilters?: boolean;
  /** Callback to clear all filters */
  onClearFilters?: () => void;
}

export function AppFilterDrawer({
  open,
  onOpenChange,
  children,
  hasActiveFilters = false,
  onClearFilters,
}: AppFilterDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[340px] flex flex-col">
        <SheetHeader className="px-0 pt-0 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between pr-12">
            <SheetTitle>Filters</SheetTitle>
            {hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * APP FILTER SECTION — Labeled group within filter drawer
 */
interface AppFilterSectionProps {
  title: string;
  children: React.ReactNode;
}

export function AppFilterSection({ title, children }: AppFilterSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * APP FILTER OPTION — Radio-style option within a filter section
 */
interface AppFilterOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function AppFilterOption({ label, selected, onClick }: AppFilterOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors",
        selected
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-muted/50"
      )}
    >
      {label}
    </button>
  );
}

/**
 * APP FILTER TRIGGER — Icon button that opens the filter drawer
 */
interface AppFilterTriggerProps {
  onClick: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export function AppFilterTrigger({
  onClick,
  hasActiveFilters = false,
  className,
}: AppFilterTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative h-10 w-10 flex items-center justify-center rounded-lg border border-border",
        "bg-card hover:bg-muted/50 transition-colors",
        "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
      aria-label="Open filters"
    >
      <Filter size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-muted-foreground" />
      {hasActiveFilters && (
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" />
      )}
    </button>
  );
}
