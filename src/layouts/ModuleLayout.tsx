import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ModuleHeader } from "@/components/app/ModuleHeader";
import { SideNav } from "@/components/app/SideNav";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNavForModule, type ModuleKey } from "@/config/moduleNav";

/**
 * MODULE LAYOUT — UNIFIED APPSHELL PATTERN
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Uses the centralized AppShell + ModuleHeader + SideNav pattern.
 * Navigation config comes from src/config/moduleNav.ts.
 * 
 * Handles: /licensing/*, /admin/*
 * ═══════════════════════════════════════════════════════════════════════════
 */

function getModuleKeyFromPath(pathname: string): ModuleKey | null {
  if (pathname.startsWith("/licensing")) return "licensing";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
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
  const showSidebar = !isMobile && navItems.length > 0;

  return (
    <AppShell
      showSidebar={showSidebar}
      headerContent={<ModuleHeader showSidebarLogo={showSidebar} />}
      sidebarContent={<SideNav items={navItems} />}
    >
      <Outlet />
    </AppShell>
  );
}
