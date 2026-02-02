import { useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ConsoleNav } from "@/components/console/ConsoleNav";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useScopeTransition } from "@/hooks/useScopeTransition";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * SYSTEM CONSOLE LAYOUT
 * 
 * Uses AppShell which now handles header internally via AppHeader.
 */
export function SystemConsoleLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { canAccessScope } = useScopeTransition();
  const { isPlatformAdmin, isExternalAuditor } = useRoleAccess();
  
  useScrollReset(mainRef);
  
  useEffect(() => {
    if (!canAccessScope && !isPlatformAdmin && !isExternalAuditor) {
      navigate("/auth/unauthorized", { replace: true });
    }
  }, [canAccessScope, isPlatformAdmin, isExternalAuditor, navigate]);

  const showSidebar = !isMobile;

  return (
    <AppShell
      showSidebar={showSidebar}
      sidebarContent={<ConsoleNav />}
    >
      <Outlet />
    </AppShell>
  );
}
