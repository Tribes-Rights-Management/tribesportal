import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { Eye, ArrowRight, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NAV_LABELS, PORTAL_TYPOGRAPHY } from "@/styles/tokens";
import { useIsMobile } from "@/hooks/use-mobile";
import { WorkspaceSelectorModal } from "@/components/admin/WorkspaceSelectorModal";

/**
 * SYSTEM CONSOLE HEADER — COMPANY-LEVEL GOVERNANCE (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE RULES (LOCKED):
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - System Console ≠ Organization Workspace
 * - NO workspace selector (System Console is company-scoped)
 * - NO product navigation (Licensing, Tribes Admin, Tribes Team)
 * - Access restricted to:
 *   • platform_admin (full access)
 *   • external_auditor (read-only access)
 * - Scoped to: governance, audit oversight, compliance, security
 * - Mobile: read-only inspection only, no primary actions
 * 
 * WORKSPACE ENTRY (CANONICAL):
 * - "Enter Workspace" button opens modal selector
 * - User must EXPLICITLY choose a workspace
 * - No implicit switching, no auto-selection
 * - Transition is intentional and explicit
 * 
 * This header is for company-level governance operations only.
 * Organization workspaces use GlobalHeader instead.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function SystemConsoleHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isExternalAuditor } = useRoleAccess();
  const { tenantMemberships } = useAuth();
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);

  const handleLogoClick = () => {
    navigate("/console");
  };

  // Show "Enter Workspace" only if user has accessible workspaces
  const hasWorkspaces = tenantMemberships.length > 0;

  // Render full-width header content for AppShell
  return (
    <>
      <div 
        className="w-full h-full flex items-center justify-between"
        style={{ 
          paddingLeft: isMobile ? 'max(16px, env(safe-area-inset-left, 16px))' : 'max(24px, env(safe-area-inset-left, 24px))',
          paddingRight: isMobile ? 'max(16px, env(safe-area-inset-right, 16px))' : 'max(24px, env(safe-area-inset-right, 24px))',
        }}
      >
        {/* Left: Wordmark */}
        <button
          onClick={handleLogoClick}
          className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded uppercase shrink-0"
          style={{
            fontSize: isMobile ? '11px' : PORTAL_TYPOGRAPHY.brandWordmark.size,
            letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
            color: 'var(--tribes-fg)',
          }}
        >
          {NAV_LABELS.BRAND_WORDMARK}
        </button>

        {/* Center: System Console label + read-only indicator for auditors */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <span 
            className={cn(
              "font-medium uppercase tracking-wider",
              isMobile ? "text-[10px]" : "text-[13px]"
            )}
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            {NAV_LABELS.SYSTEM_CONSOLE}
          </span>
          {isExternalAuditor && (
            <span 
              className={cn(
                "inline-flex items-center gap-1 font-medium uppercase tracking-wider px-2 py-0.5 rounded",
                isMobile ? "text-[8px]" : "text-[10px]"
              )}
              style={{ 
                backgroundColor: 'var(--panel-bg)',
                color: 'var(--tribes-text-muted)'
              }}
            >
              <Eye className={isMobile ? "h-2.5 w-2.5" : "h-3 w-3"} />
              {!isMobile && "Read-only"}
            </span>
          )}
        </div>

        {/* Right: Back to Modules + Enter Workspace button + Account */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Back to Modules */}
          <button
            onClick={() => navigate("/workspaces")}
            className={cn(
              "flex items-center gap-1.5 rounded transition-colors duration-150",
              "hover:bg-muted/50",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]",
              isMobile ? "h-8 w-8 justify-center" : "px-3 py-1.5 text-[12px] font-medium"
            )}
            style={{ color: 'var(--tribes-fg-secondary)' }}
            aria-label="Back to Modules"
            title="Back to Modules"
          >
            <LayoutGrid className={isMobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            {!isMobile && <span>Modules</span>}
          </button>
          
          {hasWorkspaces && (
            <button
              onClick={() => setWorkspaceModalOpen(true)}
              className={cn(
                "flex items-center gap-1.5 rounded transition-colors duration-150",
                "hover:bg-muted/50",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]",
                isMobile ? "h-8 w-8 justify-center" : "px-3 py-1.5 text-[12px] font-medium"
              )}
              style={{ color: 'var(--tribes-fg-secondary)' }}
              aria-label="Enter Workspace"
            >
              {!isMobile && <span>{NAV_LABELS.ENTER_WORKSPACE}</span>}
              <ArrowRight className={isMobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            </button>
          )}
          
          <ProfileDropdown avatarVariant="dark" contextLabel={NAV_LABELS.SYSTEM_CONSOLE} />
        </div>
      </div>

      {/* Workspace Selector Modal */}
      <WorkspaceSelectorModal 
        open={workspaceModalOpen} 
        onOpenChange={setWorkspaceModalOpen} 
      />
    </>
  );
}
