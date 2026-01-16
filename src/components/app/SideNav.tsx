import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/**
 * INSTITUTIONAL SIDE NAVIGATION (CANONICAL)
 * 
 * Design Rules:
 * - Left-aligned, no icons unless strictly necessary
 * - Active state is typographic (weight/opacity), not color-heavy
 * - No pills, chips, or floating nav
 * - Flat hierarchy, clear functional groupings
 * - No shadows or elevation
 * - No animated transitions beyond essential feedback
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
 * Active state: weight/opacity, not background color blocks
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
          "flex items-center gap-2.5 px-3 py-2 text-[13px] rounded",
          // Transition: only essential feedback (180ms institutional spec)
          "transition-colors duration-[180ms]",
          // Active: typographic emphasis, minimal background
          isActive
            ? "font-medium text-[#111] bg-black/[0.04]"
            : "text-[#6B6B6B] hover:text-[#111] hover:bg-black/[0.02]"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0 opacity-60" strokeWidth={1.5} />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export function SideNav({ items, settingsItems }: SideNavProps) {
  return (
    <nav 
      className="w-48 shrink-0 border-r border-[#E8E8E8] bg-[#FAFAFA] flex flex-col"
    >
      {/* Main navigation - functional grouping */}
      <div className="flex-1 py-3">
        <div className="px-2 space-y-0.5">
          {items.map((item) => (
            <SideNavLink key={item.to} {...item} />
          ))}
        </div>
      </div>
      
      {/* Settings at bottom - separated by minimal divider */}
      {settingsItems && settingsItems.length > 0 && (
        <div className="border-t border-[#E8E8E8] py-2">
          <div className="px-2 space-y-0.5">
            {settingsItems.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
