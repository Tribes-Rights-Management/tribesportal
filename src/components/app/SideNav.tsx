import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/**
 * INSTITUTIONAL SIDE NAVIGATION
 * 
 * Design Rules:
 * - Flat hierarchy, clear functional groupings
 * - No novelty navigation patterns
 * - No shadows or elevation
 * - No animated transitions
 * - Navigation is functional, not expressive
 */

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface SideNavProps {
  items: NavItem[];
  settingsItems?: NavItem[];
}

/**
 * Side navigation link - institutional styling
 * 
 * Visual Treatment:
 * - Minimal contrast
 * - No shadows or elevation
 * - No animated transitions beyond essential feedback
 */
function SideNavLink({ 
  to, 
  label, 
  icon: Icon, 
  exact 
}: NavItem) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        cn(
          // Base: flat, functional, minimal
          "flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-md",
          // Transition: only essential feedback (180ms institutional spec)
          "transition-colors duration-[180ms]",
          // Active: subtle highlight, no elevation
          isActive
            ? "bg-[#ECECEC] text-[#111]"
            : "text-[#6B6B6B] hover:text-[#111] hover:bg-[#F5F5F5]"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export function SideNav({ items, settingsItems }: SideNavProps) {
  return (
    <nav 
      className={cn(
        // Flat, no shadows, no elevation
        "w-52 shrink-0 border-r border-[#E5E5E5] bg-white flex flex-col",
        // No animated transitions
      )}
    >
      {/* Main navigation - functional grouping */}
      <div className="flex-1 py-4">
        <div className="px-3 space-y-0.5">
          {items.map((item) => (
            <SideNavLink key={item.to} {...item} />
          ))}
        </div>
      </div>
      
      {/* Settings at bottom - separated by minimal divider */}
      {settingsItems && settingsItems.length > 0 && (
        <div className="border-t border-[#E5E5E5] py-3">
          <div className="px-3 space-y-0.5">
            {settingsItems.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
