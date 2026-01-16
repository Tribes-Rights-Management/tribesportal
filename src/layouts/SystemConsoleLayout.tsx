import { Outlet } from "react-router-dom";
import { SystemConsoleHeader } from "@/components/app/SystemConsoleHeader";

/**
 * SYSTEM CONSOLE LAYOUT — COMPANY-LEVEL GOVERNANCE
 * 
 * ARCHITECTURE RULES (LOCKED):
 * - System Console ≠ Organization Workspace
 * - NO workspace selector (this is company-scoped, not org-scoped)
 * - NO product navigation (Licensing, Tribes Admin are org-scoped)
 * - Access restricted to executive roles (platform_admin) only
 * - Scoped to: governance, audit oversight, compliance, security
 * 
 * Products (Licensing, Tribes Admin) require an active organization context.
 * Users cannot access products without selecting an organization.
 * Each organization represents an independent operating workspace.
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
