import { useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SystemConsoleHeader } from "@/components/app/SystemConsoleHeader";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useScopeTransition } from "@/hooks/useScopeTransition";
import { useRoleAccess } from "@/hooks/useRoleAccess";

/**
 * SYSTEM CONSOLE LAYOUT — CONSOLE LIGHT (Stripe-like)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER ENFORCEMENT DIRECTIVE — LOCKED ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * System Console is NOT a workspace. It is company-level governance.
 * 
 * UI FEEL: Light canvas, white surfaces, sparse and supervisory
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
    <div 
      className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip"
      style={{ backgroundColor: 'var(--app-canvas-bg)' }}
    >
      <SystemConsoleHeader />
      <main 
        ref={mainRef} 
        className="flex-1 overflow-y-auto overflow-x-clip w-full max-w-full min-w-0"
      >
        <Outlet />
      </main>
    </div>
  );
}
