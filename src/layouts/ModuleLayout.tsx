import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { SideNav } from "@/components/app/SideNav";
import { WorkstationMobileNav } from "@/components/app/WorkstationMobileNav";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNavForModule, getModuleLabel, type ModuleKey } from "@/config/moduleNav";

/**
 * MODULE LAYOUT
 * 
 * Uses AppShell which now handles header internally via AppHeader.
 * Handles: /licensing/*, /rights/*
 */

function getModuleKeyFromPath(pathname: string): ModuleKey | null {
  if (pathname.startsWith("/licensing")) return "licensing";
  if (pathname.startsWith("/rights")) return "rights";
  return null;
}

function getModuleDisplayLabel(moduleKey: ModuleKey | null): string {
  if (!moduleKey) return "";
  return getModuleLabel(moduleKey);
}

export function ModuleLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  
  useScrollReset(mainRef);

  const moduleKey = getModuleKeyFromPath(location.pathname);
  const navItems = moduleKey ? getNavForModule(moduleKey) : [];
  const moduleLabel = getModuleDisplayLabel(moduleKey);
  const showSidebar = !isMobile && navItems.length > 0;

  return (
    <AppShell
      showSidebar={showSidebar}
      sidebarContent={<SideNav items={navItems} />}
    >
      {isMobile && navItems.length > 0 && (
        <WorkstationMobileNav moduleLabel={moduleLabel} items={navItems} />
      )}
      <Outlet />
    </AppShell>
  );
}
