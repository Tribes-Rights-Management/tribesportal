import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Eye, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NAV_LABELS, ICON_SIZE, ICON_STROKE, PORTAL_TYPOGRAPHY, PORTAL_AVATAR } from "@/styles/tokens";
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

// Account menu - minimal, governance-focused
function ConsoleAccountMenu() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "rounded-full shrink-0 inline-flex items-center justify-center",
            "text-[10px] font-medium uppercase",
            "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          )}
          style={{
            height: PORTAL_AVATAR.sizeDesktop,
            width: PORTAL_AVATAR.sizeDesktop,
            backgroundColor: PORTAL_AVATAR.bgColor,
            color: PORTAL_AVATAR.textColor,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PORTAL_AVATAR.bgColorHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PORTAL_AVATAR.bgColor}
          aria-label="Account menu"
        >
          {getInitials()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 rounded-lg bg-[#1A1A1B] border-white/10 text-white"
        sideOffset={8}
      >
        <div className="px-3 py-2.5">
          <p className="text-[13px] font-medium text-white/90 truncate">
            {profile?.full_name || profile?.email}
          </p>
          {profile?.email && profile?.full_name && (
            <p className="text-[11px] text-white/50 truncate mt-0.5">
              {profile.email}
            </p>
          )}
          <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">
            {NAV_LABELS.SYSTEM_CONSOLE}
          </p>
        </div>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem
          onClick={() => navigate("/account")}
          className="text-[13px] py-2 text-white/70 focus:bg-white/10 focus:text-white"
        >
          <Settings size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2 opacity-70" />
          {NAV_LABELS.ACCOUNT_SETTINGS}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-[13px] py-2 text-red-400 focus:bg-white/10 focus:text-red-300"
        >
          <LogOut size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SystemConsoleHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isExternalAuditor } = useRoleAccess();
  const { tenantMemberships } = useAuth();
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);

  const handleLogoClick = () => {
    navigate("/admin");
  };

  // Show "Enter Workspace" only if user has accessible workspaces
  const hasWorkspaces = tenantMemberships.length > 0;

  return (
    <>
      <header 
        className="h-14 border-b border-white/8 px-4 md:px-6 flex items-center shrink-0 sticky top-0 z-40"
        style={{ backgroundColor: 'var(--tribes-bg-header)' }}
      >
        {/* Left: Wordmark */}
        <div className="flex items-center min-w-0">
          <button
            onClick={handleLogoClick}
            className="font-semibold text-white hover:text-white/70 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded uppercase"
            style={{
              fontSize: isMobile ? '11px' : PORTAL_TYPOGRAPHY.brandWordmark.size,
              letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
            }}
          >
            {NAV_LABELS.BRAND_WORDMARK}
          </button>
        </div>

        {/* Center: System Console label + read-only indicator for auditors */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <span 
            className="text-[11px] md:text-[13px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            {NAV_LABELS.SYSTEM_CONSOLE}
          </span>
          {isExternalAuditor && (
            <span 
              className="hidden md:inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: 'var(--tribes-border-subtle)',
                color: 'var(--tribes-text-muted)'
              }}
            >
              <Eye className="h-3 w-3" />
              Read-only
            </span>
          )}
        </div>

        {/* Right: Enter Workspace button + Account */}
        <div className="flex items-center gap-3">
          {/* Enter Workspace - secondary action, not primary CTA */}
          {hasWorkspaces && (
            <button
              onClick={() => setWorkspaceModalOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded",
                "text-[12px] font-medium",
                "hover:bg-white/[0.04] transition-colors duration-150",
                "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30",
                // Mobile: full-width secondary action
                isMobile && "flex-1 justify-center py-2"
              )}
              style={{ color: 'var(--tribes-text-secondary)' }}
            >
              <span>{NAV_LABELS.ENTER_WORKSPACE}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          
          <ConsoleAccountMenu />
        </div>
      </header>

      {/* Mobile: Read-only notice bar for external auditors */}
      {isMobile && isExternalAuditor && (
        <div 
          className="px-4 py-2 text-center"
          style={{ 
            backgroundColor: 'var(--tribes-surface-card)',
            borderBottom: '1px solid var(--tribes-border-subtle)'
          }}
        >
          <span 
            className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            <Eye className="h-3 w-3" />
            System Console: Read-only access
          </span>
        </div>
      )}

      {/* Workspace Selector Modal */}
      <WorkspaceSelectorModal 
        open={workspaceModalOpen} 
        onOpenChange={setWorkspaceModalOpen} 
      />
    </>
  );
}
