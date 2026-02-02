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
 * 
 * Note: Uses custom implementation (not AppDropdown) because this is a
 * full-width nav bar with NavLink items, not a positioned menu dropdown.
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

  // Close on escape key
  useEffect(() => {
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

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger bar — full width, below header, 20px edge padding to match header/content */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between py-4",
          "bg-background border-b border-border/60",
          "active:bg-muted/30 transition-colors duration-100"
        )}
        style={{ paddingLeft: 20, paddingRight: 20 }}
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
          role="menu"
          aria-orientation="vertical"
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
                    "block w-full text-left h-12 flex items-center",
                    "text-[14px]",
                    "hover:bg-muted/50 focus:bg-muted/50",
                    "transition-colors duration-100",
                    !isLast && "border-b border-border/40",
                    isActive
                      ? "font-medium text-foreground"
                      : "font-normal text-foreground/80"
                  )
                }
                style={{ paddingLeft: 20, paddingRight: 20 }}
                role="menuitem"
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
