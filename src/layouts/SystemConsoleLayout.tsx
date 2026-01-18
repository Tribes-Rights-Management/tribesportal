import { useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SystemConsoleHeader } from "@/components/app/SystemConsoleHeader";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useScopeTransition } from "@/hooks/useScopeTransition";
import { useRoleAccess } from "@/hooks/useRoleAccess";

/**
 * SYSTEM CONSOLE LAYOUT — COMPANY-LEVEL GOVERNANCE (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER ENFORCEMENT DIRECTIVE — LOCKED ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * System Console is NOT a workspace. It is company-level governance.
 * 
 * ─────────────────────────────────────────────────────────────────────────
 * ACCESS CONTROL
 * ─────────────────────────────────────────────────────────────────────────
 * - platform_admin: Full access to all governance surfaces
 * - external_auditor: Read-only access for inspection
 * 
 * ─────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE RULES (IMMUTABLE)
 * ─────────────────────────────────────────────────────────────────────────
 * - System Console ≠ Organization Workspace
 * - NO workspace selector (this is company-scoped, not org-scoped)
 * - NO product navigation (Licensing, Tribes Admin, Tribes Team)
 * - External auditors have read-only access
 * - Scoped to: governance, audit oversight, compliance, security
 * 
 * ─────────────────────────────────────────────────────────────────────────
 * WHAT SYSTEM CONSOLE MAY CONTAIN
 * ─────────────────────────────────────────────────────────────────────────
 * - Governance dashboards
 * - Security posture
 * - Audit logs
 * - Regulatory disclosures
 * - Cross-workspace reporting
 * - Correlation views
 * - Financial Governance (billing configuration, not transactions)
 * 
 * ─────────────────────────────────────────────────────────────────────────
 * WHAT SYSTEM CONSOLE MUST NEVER CONTAIN
 * ─────────────────────────────────────────────────────────────────────────
 * - Licensing
 * - Tribes Admin
 * - Tribes Team
 * - Operational queues
 * - Catalogs
 * - Requests
 * - Client or licensee actions
 * - Any organization-scoped views
 * - Any workspace-specific data
 * - Any operational workflows or actions
 * - Payment submission (governance only, never operations)
 * 
 * ─────────────────────────────────────────────────────────────────────────
 * MOBILE BEHAVIOR
 * ─────────────────────────────────────────────────────────────────────────
 * - Read-only governance, audit, disclosures
 * - No workspace switcher
 * - No operational tools
 * - No primary actions permitted on mobile
 * 
 * UI FEEL: Sparse, supervisory, non-operational
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function SystemConsoleLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { canAccessScope, validateScopeAccess } = useScopeTransition();
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
      style={{ backgroundColor: 'var(--tribes-bg)' }}
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
