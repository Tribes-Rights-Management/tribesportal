import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ModuleHeader } from "@/components/app/ModuleHeader";

/**
 * ADMIN LAYOUT — UNIFIED APPSHELL (NO SIDEBAR)
 * 
 * Layout Rules:
 * - Light canvas with white surfaces
 * - No sidebar (admin dashboard is full-width)
 * - Uses unified ModuleHeader for consistency
 */
export function AdminLayout() {
  return (
    <AppShell
      showSidebar={false}
      headerContent={<ModuleHeader showSidebarLogo={false} />}
    >
      <Outlet />
    </AppShell>
  );
}
