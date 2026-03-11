import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppListToolbarProps {
  /** Search placeholder text */
  placeholder?: string;
  /** Current search value */
  searchValue: string;
  /** Search change handler */
  onSearchChange: (value: string) => void;
  /** Optional count display (e.g., "1,967 writers") */
  count?: string;
  /** Optional action slot (button) — rendered on the right */
  action?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function AppListToolbar({
  placeholder = "Search...",
  searchValue,
  onSearchChange,
  count,
  action,
  className,
}: AppListToolbarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-5", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-11 pl-9 pr-3 text-sm bg-white border border-[var(--border-subtle)] rounded-lg shadow-sm focus:outline-none focus:border-[var(--border-strong)] focus:shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all"
        />
      </div>

      {count && (
        <span className="text-[13px] text-muted-foreground whitespace-nowrap">
          {count}
        </span>
      )}
      {action && (
        <div className="flex items-center shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
