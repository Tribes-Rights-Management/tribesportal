import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/moduleNav";

/**
 * WORKSTATION MOBILE NAV — APPLE-STYLE COLLAPSIBLE NAVIGATION
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Full-width navigation bar that appears below the header on mobile.
 * Matches Apple's account page pattern:
 * - Module name + chevron as trigger
 * - Full-width dropdown with dividers
 * - No icons, minimal styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface WorkstationMobileNavProps {
  moduleLabel: string;
  items: NavItem[];
}

export function WorkstationMobileNav({ moduleLabel, items }: WorkstationMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger bar — full width, below header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-4",
          "bg-background border-b border-border/60",
          "active:bg-muted/30 transition-colors duration-100"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-[15px] font-semibold text-foreground">
          {moduleLabel}
        </span>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
          strokeWidth={1.5}
        />
      </button>

      {/* Dropdown menu — full width, Apple-style */}
      {isOpen && (
        <div 
          className={cn(
            "absolute left-0 right-0 top-full z-50",
            "bg-background border-b border-border/60 shadow-sm"
          )}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    "block w-full text-left px-4 py-4",
                    "text-[15px]",
                    !isLast && "border-b border-border/40",
                    isActive
                      ? "font-medium text-foreground"
                      : "font-normal text-foreground/80"
                  )
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
