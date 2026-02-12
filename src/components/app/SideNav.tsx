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
 * - Row padding: px-3 py-2
 * - Font size: 13px
 * - Active state: bg-muted, font-medium
 * - Hover state: bg-muted/50
 * - Focus ring: brand blue (#0071E3)
 * - LEFT ALIGNED: icon + label must be left-aligned, never centered
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
 * SIDE NAV LINK — STRIPE-LIKE LEFT-ALIGNED ROWS (CANONICAL)
 * 
 * ICON SIZE: 16px (h-4 w-4) — HARD RULE
 * ALIGNMENT: flex items-center justify-start (left-aligned)
 * GAP: gap-3 between icon and text
 * TEXT: 13px, left-aligned
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
          // Left-aligned row — 38px height, 13px text
          "flex items-center justify-start gap-3 px-4 py-[9px] text-[14px] rounded-md text-left w-full",
          // Transition
          "transition-colors duration-150",
          // Focus ring: brand blue
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]",
          // Active: subtle left border, near-black text, visible wash
          isActive
            ? "font-medium text-[#111827] bg-[#EAECEF] rounded-lg"
            : "font-normal text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg"
        )
      }
    >
      {/* Icon: 18px — STRICT */}
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
      <span className="truncate text-left">{label}</span>
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