import { useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { SystemConsoleHeader } from "@/components/app/SystemConsoleHeader";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useScopeTransition } from "@/hooks/useScopeTransition";
import { useRoleAccess } from "@/hooks/useRoleAccess";

/**
 * SYSTEM CONSOLE LAYOUT — STRIPE-LIKE SHELL (NO SIDEBAR)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * System Console is NOT a workspace. It is company-level governance.
 * Uses a simple full-width layout without sidebar.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function SystemConsoleLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
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

  return (
    <AppShell
      showSidebar={false}
      headerContent={<SystemConsoleHeader />}
    >
      <Outlet />
    </AppShell>
  );
}
