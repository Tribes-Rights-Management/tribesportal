import { useRef } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";
import { LicensingNav } from "@/components/app/LicensingNav";
import { PublishingNav } from "@/components/app/PublishingNav";
import { AppFooter } from "@/components/app/AppFooter";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * APP LAYOUT — STRIPE-LIKE GRID SHELL (CANONICAL)
 * 
 * Layout Rules:
 * - Desktop: 2-column CSS Grid (sidebar + content)
 * - Sidebar starts at y=0 (full viewport height)
 * - Header spans full width with logo in sidebar column
 * - Mobile: stacked layout (header above content)
 * 
 * WORKSPACE TRANSITION:
 * - When entering from System Console, sidebar appears
 * - Exit to System Console via user menu only
 */
export function AppLayout() {
  const { activeContext } = useAuth();
  const mainRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  
  // Enforce scroll reset on route changes (per Navigation Enforcement Spec)
  useScrollReset(mainRef);

  // Determine which sidebar to show
  const getSidebarContent = () => {
    if (activeContext === "licensing") return <LicensingNav />;
    if (activeContext === "publishing") return <PublishingNav />;
    return null;
  };

  const sidebarContent = getSidebarContent();
  const showSidebar = !isMobile && !!sidebarContent;

  return (
    <AppShell
      showSidebar={showSidebar}
      headerContent={<AppHeader showSidebarLogo={showSidebar} />}
      sidebarContent={sidebarContent}
      footer={<AppFooter />}
    >
      <Outlet />
    </AppShell>
  );
}
