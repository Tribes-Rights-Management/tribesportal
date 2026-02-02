import { useRef } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { LicensingNav } from "@/components/app/LicensingNav";
import { PublishingNav } from "@/components/app/PublishingNav";
import { AppFooter } from "@/components/app/AppFooter";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * APP LAYOUT
 * 
 * Uses AppShell which now handles header internally via AppHeader.
 */
export function AppLayout() {
  const { activeContext } = useAuth();
  const mainRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  
  useScrollReset(mainRef);

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
      sidebarContent={sidebarContent}
      footer={<AppFooter />}
    >
      <Outlet />
    </AppShell>
  );
}
