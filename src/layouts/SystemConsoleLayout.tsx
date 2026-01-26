import { useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ModuleHeader } from "@/components/app/ModuleHeader";
import { ConsoleNav } from "@/components/console/ConsoleNav";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useScopeTransition } from "@/hooks/useScopeTransition";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * SYSTEM CONSOLE LAYOUT — STRIPE-LIKE SHELL WITH SIDEBAR
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * System Console is company-level governance with a persistent left sidebar.
 * Uses the unified AppShell with ConsoleNav for navigation.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function SystemConsoleLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { canAccessScope } = useScopeTransition();
  const { isPlatformAdmin, isExternalAuditor } = useRoleAccess();
  
  // Enforce scroll reset on route changes (per Navigation Enforcement Spec)
  useScrollReset(mainRef);
  
  // Validate scope access on mount - redirect if unauthorized
  useEffect(() => {
    if (!canAccessScope && !isPlatformAdmin && !isExternalAuditor) {
      navigate("/auth/unauthorized", { replace: true });
    }
  }, [canAccessScope, isPlatformAdmin, isExternalAuditor, navigate]);

  // Show sidebar on desktop
  const showSidebar = !isMobile;

  return (
    <AppShell
      showSidebar={showSidebar}
      headerContent={<ModuleHeader showSidebarLogo={showSidebar} />}
      sidebarContent={<ConsoleNav />}
    >
      <Outlet />
    </AppShell>
  );
}
