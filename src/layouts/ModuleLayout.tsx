import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { GlobalHeader } from "@/components/app/GlobalHeader";
import { SideNav } from "@/components/app/SideNav";
import { WorkspaceContextBar } from "@/components/app/WorkspaceContextBar";
import { useScrollReset } from "@/hooks/useScrollReset";
import { 
  LayoutDashboard, 
  FileText, 
  Scale, 
  FolderOpen,
  FileCheck,
  Receipt,
  CreditCard,
} from "lucide-react";
import type { NavItem } from "@/components/app/SideNav";

/**
 * MODULE LAYOUT — INSTITUTIONAL SHELL FOR FIRST-CLASS MODULES
 * 
 * Layout Rules:
 * - Dark canvas persists (no light mode)
 * - Flat hierarchy, no elevation
 * - Seamless continuation from marketing + auth
 * - Module-specific side navigation
 * - WorkspaceContextBar confirms operational context
 * 
 * WORKSPACE TRANSITION:
 * - When entering from System Console, sidebar appears
 * - Context bar confirms active workspace
 * - Exit to System Console via user menu only
 */

// Licensing module navigation
const licensingNavItems: NavItem[] = [
  { to: "/licensing", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/licensing/requests", label: "Requests", icon: FileText },
  { to: "/licensing/agreements", label: "Agreements", icon: Scale },
  { to: "/licensing/payments", label: "Payments", icon: CreditCard },
];

// Tribes Admin module navigation (renamed from "Client Portal")
const portalNavItems: NavItem[] = [
  { to: "/portal", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/portal/agreements", label: "Agreements", icon: FileCheck },
  { to: "/portal/statements", label: "Statements", icon: Receipt },
  { to: "/portal/documents", label: "Documents", icon: FolderOpen },
  { to: "/portal/payments", label: "Payments", icon: CreditCard },
];

function getNavItemsForPath(pathname: string): NavItem[] {
  if (pathname.startsWith("/licensing")) {
    return licensingNavItems;
  }
  if (pathname.startsWith("/portal")) {
    return portalNavItems;
  }
  return [];
}

export function ModuleLayout() {
  const location = useLocation();
  const navItems = getNavItemsForPath(location.pathname);
  const mainRef = useRef<HTMLElement>(null);
  
  // Enforce scroll reset on route changes (per Navigation Enforcement Spec)
  useScrollReset(mainRef);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--tribes-bg-page)' }}
    >
      <GlobalHeader />
      <WorkspaceContextBar />
      <div className="flex flex-1 overflow-hidden">
        {navItems.length > 0 && <SideNav items={navItems} />}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
