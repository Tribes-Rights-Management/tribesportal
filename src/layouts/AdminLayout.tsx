import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";

/**
 * ADMIN LAYOUT — STRIPE-LIKE SHELL (NO SIDEBAR)
 * 
 * Layout Rules:
 * - Light canvas with white surfaces
 * - No sidebar (admin dashboard is full-width)
 * - Institutional command center aesthetic
 */
export function AdminLayout() {
  return (
    <AppShell
      showSidebar={false}
      headerContent={<AppHeader showSidebarLogo={false} />}
    >
      <Outlet />
    </AppShell>
  );
}
