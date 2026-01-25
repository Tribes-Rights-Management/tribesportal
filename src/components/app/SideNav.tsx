import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useRoleAccess, Permission } from "@/hooks/useRoleAccess";

/**
 * INSTITUTIONAL SIDE NAVIGATION — CONSOLE LIGHT (Stripe-like)
 * 
 * Design Rules:
 * - White surface with subtle border
 * - Active state: light wash, not color-heavy
 * - No pills, chips, or floating nav
 * - Flat hierarchy, clear functional groupings
 * - No shadows or elevation
 * - Brand blue (#0071E3) only for focus
 */

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Required permission to render this item. If not provided, always renders. */
  requiredPermission?: Permission;
}

interface SideNavProps {
  items: NavItem[];
  settingsItems?: NavItem[];
}

/**
 * Side navigation link - Console Light styling
 * Active state: muted wash, weight emphasis
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
          "flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg",
          // Transition: only essential feedback
          "transition-colors duration-150",
          // Focus ring: brand blue
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]",
          // Active: typographic emphasis, subtle surface
          isActive
            ? "font-medium text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0 opacity-60" strokeWidth={1.25} />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export function SideNav({ items, settingsItems }: SideNavProps) {
  const { shouldRenderNavItem } = useRoleAccess();

  // Filter items by permission - no placeholders, no disabled items
  const visibleItems = items.filter(item => 
    !item.requiredPermission || shouldRenderNavItem(item.requiredPermission)
  );
  
  const visibleSettingsItems = settingsItems?.filter(item =>
    !item.requiredPermission || shouldRenderNavItem(item.requiredPermission)
  );

  // Don't render empty nav sections
  if (visibleItems.length === 0 && (!visibleSettingsItems || visibleSettingsItems.length === 0)) {
    return null;
  }

  return (
    <nav 
      className="w-48 shrink-0 flex flex-col"
      style={{ 
        backgroundColor: 'var(--app-sidebar-bg)',
        borderRight: '1px solid var(--app-chrome-border)'
      }}
    >
      {/* Main navigation - functional grouping */}
      {visibleItems.length > 0 && (
        <div className="flex-1 py-4">
          <div className="px-3 space-y-0.5">
            {visibleItems.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </div>
        </div>
      )}
      
      {/* Settings at bottom - separated by hairline */}
      {visibleSettingsItems && visibleSettingsItems.length > 0 && (
        <div 
          className="py-3"
          style={{ borderTop: '1px solid var(--app-chrome-border)' }}
        >
          <div className="px-3 space-y-0.5">
            {visibleSettingsItems.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
