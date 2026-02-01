import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ModuleHeader } from "@/components/app/ModuleHeader";
import { SideNav } from "@/components/app/SideNav";
import { WorkstationMobileNav } from "@/components/app/WorkstationMobileNav";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNavForModule, getModuleLabel, type ModuleKey } from "@/config/moduleNav";

/**
 * MODULE LAYOUT — UNIFIED APPSHELL PATTERN
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Uses the centralized AppShell + ModuleHeader + SideNav pattern.
 * Navigation config comes from src/config/moduleNav.ts.
 * 
 * Handles: /licensing/*, /rights/*
 * 
 * MOBILE: Shows Apple-style collapsible nav bar below header.
 * ═══════════════════════════════════════════════════════════════════════════
 */

function getModuleKeyFromPath(pathname: string): ModuleKey | null {
  if (pathname.startsWith("/licensing")) return "licensing";
  if (pathname.startsWith("/rights")) return "rights";
  return null;
}

function getModuleDisplayLabel(moduleKey: ModuleKey | null): string {
  switch (moduleKey) {
    case "licensing":
      return "Tribes Licensing";
    case "rights":
      return "Tribes Rights";
    default:
      return "";
  }
}

export function ModuleLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  
  // Enforce scroll reset on route changes
  useScrollReset(mainRef);

  // Get nav items from centralized config
  const moduleKey = getModuleKeyFromPath(location.pathname);
  const navItems = moduleKey ? getNavForModule(moduleKey) : [];
  const moduleLabel = getModuleDisplayLabel(moduleKey);
  const showSidebar = !isMobile && navItems.length > 0;

  return (
    <AppShell
      showSidebar={showSidebar}
      headerContent={<ModuleHeader showSidebarLogo={showSidebar} />}
      sidebarContent={<SideNav items={navItems} />}
    >
      {/* Mobile navigation bar — appears below header */}
      {isMobile && navItems.length > 0 && (
        <WorkstationMobileNav moduleLabel={moduleLabel} items={navItems} />
      )}
      <Outlet />
    </AppShell>
  );
}
