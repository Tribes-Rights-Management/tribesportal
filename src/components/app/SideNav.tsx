import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useRoleAccess, Permission } from "@/hooks/useRoleAccess";

/**
 * INSTITUTIONAL SIDE NAVIGATION — DARK CANVAS (CANONICAL)
 * 
 * Design Rules:
 * - Dark surface matching platform canvas
 * - Left-aligned, no icons unless strictly necessary
 * - Active state is typographic (weight/opacity), not color-heavy
 * - No pills, chips, or floating nav
 * - Flat hierarchy, clear functional groupings
 * - No shadows or elevation
 * - Hairline border separation
 * 
 * Role-Based Surface Pruning:
 * - Navigation items dynamically filtered per role
 * - No empty sections rendered
 * - No placeholder items
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
 * Side navigation link - dark institutional styling
 * Active state: weight/opacity, subtle background
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
          // Active: typographic emphasis, subtle surface
          isActive
            ? "font-medium text-[var(--platform-text)] bg-white/[0.06]"
            : "text-[var(--platform-text-secondary)] hover:text-[var(--platform-text)] hover:bg-white/[0.03]"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0 opacity-60" strokeWidth={1.5} />
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
        backgroundColor: 'var(--platform-surface)',
        borderRight: '1px solid var(--platform-border)'
      }}
    >
      {/* Main navigation - functional grouping */}
      {visibleItems.length > 0 && (
        <div className="flex-1 py-3">
          <div className="px-2 space-y-0.5">
            {visibleItems.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </div>
        </div>
      )}
      
      {/* Settings at bottom - separated by hairline */}
      {visibleSettingsItems && visibleSettingsItems.length > 0 && (
        <div 
          className="py-2"
          style={{ borderTop: '1px solid var(--platform-border)' }}
        >
          <div className="px-2 space-y-0.5">
            {visibleSettingsItems.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
