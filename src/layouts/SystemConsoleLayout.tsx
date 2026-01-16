import { Outlet } from "react-router-dom";
import { SystemConsoleHeader } from "@/components/app/SystemConsoleHeader";

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
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <SystemConsoleHeader />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
