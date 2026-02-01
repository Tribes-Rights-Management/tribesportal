import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/moduleNav";

/**
 * MOBILE MODULE NAVIGATION — COLLAPSIBLE HEADER DROPDOWN
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Replaces hidden sidebar on mobile with a tappable module name dropdown.
 * Displays all nav items in a clean dropdown below the header.
 * 
 * BEHAVIOR:
 * - Tap module name → toggle dropdown
 * - Tap nav item → navigate and close
 * - Tap outside → close
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface MobileModuleNavProps {
  moduleLabel: string;
  items: NavItem[];
}

export function MobileModuleNav({ moduleLabel, items }: MobileModuleNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 -ml-2 rounded-md",
          "text-[14px] font-medium text-foreground",
          "hover:bg-muted/50 active:bg-muted",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{moduleLabel}</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-150",
            isOpen && "rotate-180"
          )} 
          strokeWidth={1.5}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className={cn(
            "absolute left-0 top-full mt-1 z-50",
            "min-w-[200px] py-1.5 rounded-lg",
            "bg-popover border border-border shadow-sm"
          )}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 text-[13px]",
                    "transition-colors duration-100",
                    isActive
                      ? "font-medium text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.5} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
