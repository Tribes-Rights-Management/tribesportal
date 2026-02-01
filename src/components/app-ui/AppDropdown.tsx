import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP DROPDOWN — INSTITUTIONAL MENU COMPONENT
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * A minimal, Apple-style dropdown menu with:
 * - Subtle shadow and thin border
 * - Clean vertical list with thin dividers
 * - Consistent sizing and spacing from design system
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
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Filter out hidden items
  const visibleItems = items.filter((item) => !item.hidden);

  // Close dropdown when clicking/touching outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      // Use both mousedown and touchstart for cross-device support
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close on escape key
  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: AppDropdownItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger - using onClick which works for both mouse and touch */}
      <div 
        onClick={handleTriggerClick}
        role="button"
        tabIndex={0}
        style={{ touchAction: "manipulation" }}
      >
        {trigger}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 z-50",
            "bg-background border border-border rounded-xl",
            "shadow-lg overflow-hidden",
            align === "end" ? "right-0" : "left-0",
            className
          )}
          style={{ minWidth }}
          role="menu"
          aria-orientation="vertical"
        >
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1;
            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full text-left px-4 h-12",
                  "text-[14px] font-normal text-foreground",
                  "hover:bg-muted/50 focus:bg-muted/50",
                  "transition-colors duration-100",
                  "focus:outline-none",
                  !isLast && "border-b border-border/40"
                )}
                role="menuitem"
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
