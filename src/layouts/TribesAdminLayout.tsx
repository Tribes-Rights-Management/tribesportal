import { useRef } from "react";
import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ModuleHeader } from "@/components/app/ModuleHeader";
import { SideNav } from "@/components/app/SideNav";
import { MobileModuleNav } from "@/components/app/MobileModuleNav";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNavForModule, getModuleLabel } from "@/config/moduleNav";

/**
 * TRIBES ADMIN LAYOUT — UNIFIED APPSHELL PATTERN
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Uses the centralized AppShell + ModuleHeader + SideNav pattern.
 * Navigation config comes from src/config/moduleNav.ts.
 * 
 * MOBILE: Shows collapsible header nav dropdown instead of sidebar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function TribesAdminLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  
  // Enforce scroll reset on route changes
  useScrollReset(mainRef);

  // Get nav items from centralized config
  const navItems = getNavForModule("admin");
  const moduleLabel = getModuleLabel("admin");
  const showSidebar = !isMobile;

  return (
    <AppShell
      showSidebar={showSidebar}
      headerContent={
        <ModuleHeader 
          showSidebarLogo={showSidebar}
          mobileNav={isMobile ? <MobileModuleNav moduleLabel="Admin" items={navItems} /> : undefined}
        />
      }
      sidebarContent={<SideNav items={navItems} />}
    >
      <Outlet />
    </AppShell>
  );
}
