import { useRef } from "react";
import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { SideNav } from "@/components/app/SideNav";
import { WorkstationMobileNav } from "@/components/app/WorkstationMobileNav";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNavForModule } from "@/config/moduleNav";

/**
 * HELP WORKSTATION LAYOUT
 * 
 * Uses AppShell which now handles header internally via AppHeader.
 * This ensures logo position is identical across all pages.
 */

export function HelpWorkstationLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  
  useScrollReset(mainRef);

  const navItems = getNavForModule("help");
  const moduleLabel = "Help Workstation";
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
