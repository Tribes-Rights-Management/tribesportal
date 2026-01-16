import { Outlet } from "react-router-dom";
import { SystemConsoleHeader } from "@/components/app/SystemConsoleHeader";

/**
 * SYSTEM CONSOLE LAYOUT — COMPANY-LEVEL GOVERNANCE
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER ENFORCEMENT DIRECTIVE — LOCKED ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * System Console is NOT a workspace. It is company-level governance.
 * 
 * ARCHITECTURE RULES (IMMUTABLE):
 * - System Console ≠ Organization Workspace
 * - NO workspace selector (this is company-scoped, not org-scoped)
 * - NO product navigation (Licensing, Tribes Admin are org-scoped)
 * - Access restricted to executive roles (platform_owner) only
 * - External auditors have read-only access
 * - Scoped to: governance, audit oversight, compliance, security
 * 
 * WHAT SYSTEM CONSOLE MAY CONTAIN:
 * - Governance dashboards
 * - Security posture
 * - Audit logs
 * - Regulatory disclosures
 * - Cross-workspace reporting
 * - Correlation views
 * 
 * WHAT SYSTEM CONSOLE MUST NEVER CONTAIN:
 * - Licensing
 * - Tribes Admin
 * - Operational queues
 * - Catalogs
 * - Requests
 * - Client or licensee actions
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
