import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";
import { SideNav } from "@/components/app/SideNav";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  LayoutDashboard, 
  FileText, 
  Scale, 
  FolderOpen,
  FileCheck,
  Receipt,
  CreditCard,
  Users,
} from "lucide-react";
import type { NavItem } from "@/components/app/SideNav";

/**
 * MODULE LAYOUT — STRIPE-LIKE GRID SHELL (CANONICAL)
 * 
 * Layout Rules:
 * - Desktop: 2-column CSS Grid (sidebar + content)
 * - Sidebar starts at y=0 (full viewport height)
 * - Header spans full width with logo in sidebar column
 * - Mobile: stacked layout (header above content)
 * - Module-specific side navigation
 */

// Licensing module navigation
const licensingNavItems: NavItem[] = [
  { to: "/licensing", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/licensing/requests", label: "Requests", icon: FileText },
  { to: "/licensing/agreements", label: "Agreements", icon: Scale },
  { to: "/licensing/payments", label: "Payments", icon: CreditCard },
];

// Tribes Admin module navigation — ORGANIZATION-SCOPED
const adminNavItems: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/agreements", label: "Agreements", icon: FileCheck },
  { to: "/admin/statements", label: "Statements", icon: Receipt },
  { to: "/admin/documents", label: "Documents", icon: FolderOpen },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/users", label: "Users", icon: Users },
];

function getNavItemsForPath(pathname: string): NavItem[] {
  if (pathname.startsWith("/licensing")) {
    return licensingNavItems;
  }
  if (pathname.startsWith("/admin")) {
    return adminNavItems;
  }
  return [];
}

export function ModuleLayout() {
  const location = useLocation();
  const navItems = getNavItemsForPath(location.pathname);
  const mainRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  
  // Enforce scroll reset on route changes (per Navigation Enforcement Spec)
  useScrollReset(mainRef);

  const showSidebar = !isMobile && navItems.length > 0;

  return (
    <AppShell
      showSidebar={showSidebar}
      headerContent={<AppHeader showSidebarLogo={showSidebar} />}
      sidebarContent={<SideNav items={navItems} />}
    >
      <Outlet />
    </AppShell>
  );
}
