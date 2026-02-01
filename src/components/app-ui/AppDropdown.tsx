import * as React from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * APP DROPDOWN — INSTITUTIONAL MENU COMPONENT
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * A minimal, Apple-style dropdown menu using Radix UI for reliable behavior.
 * - Subtle shadow and thin border
 * - Clean vertical list with thin dividers
 * - Consistent sizing and spacing from design system
 * - Works correctly on all pages and viewports
 * 
 * Usage:
 *   <AppDropdown
 *     trigger={<button>Open</button>}
 *     items={[
 *       { label: "Settings", onClick: () => navigate("/settings") },
 *       { label: "Sign Out", onClick: handleSignOut },
 *     ]}
 *   />
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface AppDropdownItem {
  label: string;
  onClick: () => void;
  /** Whether this item should be hidden */
  hidden?: boolean;
}

export interface AppDropdownProps {
  /** The trigger element that opens the dropdown */
  trigger: React.ReactNode;
  /** Array of menu items */
  items: AppDropdownItem[];
  /** Alignment of dropdown relative to trigger */
  align?: "start" | "end";
  /** Minimum width of dropdown menu */
  minWidth?: number;
  /** Custom className for the dropdown container */
  className?: string;
}

export function AppDropdown({
  trigger,
  items,
  align = "end",
  minWidth = 200,
  className,
}: AppDropdownProps) {
  // Filter out hidden items
  const visibleItems = items.filter((item) => !item.hidden);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className={cn(
          "bg-background border border-border rounded-xl",
          "shadow-lg overflow-hidden p-0",
          className
        )}
        style={{ minWidth }}
      >
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          return (
            <DropdownMenuItem
              key={item.label}
              onClick={item.onClick}
              className={cn(
                "px-4 h-12 cursor-pointer rounded-none",
                "text-[14px] font-normal text-foreground",
                "hover:bg-muted/50 focus:bg-muted/50",
                "transition-colors duration-100",
                !isLast && "border-b border-border/40"
              )}
            >
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
