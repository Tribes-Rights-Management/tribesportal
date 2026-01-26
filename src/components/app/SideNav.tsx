import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useRoleAccess, Permission } from "@/hooks/useRoleAccess";

/**
 * UNIFIED SIDE NAVIGATION — STRIPE-LIKE (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * This is the SINGLE sidebar navigation component used across ALL modules:
 * - /console, /admin, /licensing, /help
 * 
 * STRICT INVARIANTS:
 * - Sidebar width: 200px (controlled by AppShell)
 * - Icon size: 16px (h-4 w-4)
 * - Icon stroke: 1.5
 * - Row padding: px-2.5 py-1.5
 * - Font size: 13px
 * - Active state: bg-muted, font-medium
 * - Hover state: bg-muted/50
 * - Focus ring: brand blue (#0071E3)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  section?: "main" | "secondary" | "settings";
  /** Required permission to render this item. If not provided, always renders. */
  requiredPermission?: Permission;
}

interface SideNavProps {
  items: NavItem[];
}

/**
 * Side navigation link - Unified Stripe-like styling
 * INVARIANTS: 16px icons, 13px text, reduced padding
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
          // Standardized spacing: 16px icons, 13px text
          "flex items-center gap-2 px-2.5 py-1.5 text-[13px] rounded-md",
          // Transition
          "transition-colors duration-150",
          // Focus ring: brand blue
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]",
          // Active/hover states
          isActive
            ? "font-medium text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0 opacity-60" strokeWidth={1.5} />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export function SideNav({ items }: SideNavProps) {
  const { shouldRenderNavItem } = useRoleAccess();

  // Filter items by permission - no placeholders, no disabled items
  const visibleItems = items.filter(item => 
    !item.requiredPermission || shouldRenderNavItem(item.requiredPermission)
  );

  // Separate items by section
  const mainItems = visibleItems.filter(item => !item.section || item.section === "main");
  const secondaryItems = visibleItems.filter(item => item.section === "secondary");
  const settingsItems = visibleItems.filter(item => item.section === "settings");

  // Don't render empty nav
  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <nav 
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Main navigation - tighter vertical rhythm */}
      {mainItems.length > 0 && (
        <div className="flex-1 py-3 overflow-y-auto">
          <div className="px-2 space-y-px">
            {mainItems.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </div>
          
          {/* Secondary section (if any) */}
          {secondaryItems.length > 0 && (
            <div 
              className="mt-4 pt-3 px-2 space-y-px"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              {secondaryItems.map((item) => (
                <SideNavLink key={item.to} {...item} />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Settings at bottom - separated by hairline */}
      {settingsItems.length > 0 && (
        <div 
          className="py-2 shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <div className="px-2 space-y-px">
            {settingsItems.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
