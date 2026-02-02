import { useRef } from "react";
import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { SideNav } from "@/components/app/SideNav";
import { WorkstationMobileNav } from "@/components/app/WorkstationMobileNav";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNavForModule, getModuleLabel } from "@/config/moduleNav";

/**
 * TRIBES ADMIN LAYOUT
 * 
 * Uses AppShell which now handles header internally via AppHeader.
 */

export function TribesAdminLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  
  useScrollReset(mainRef);

  const navItems = getNavForModule("admin");
  const moduleLabel = getModuleLabel("admin");
  const showSidebar = !isMobile;

  return (
    <AppShell
      showSidebar={showSidebar}
      sidebarContent={<SideNav items={navItems} />}
    >
      {isMobile && (
        <WorkstationMobileNav moduleLabel={moduleLabel} items={navItems} />
      )}
      <Outlet />
    </AppShell>
  );
}
