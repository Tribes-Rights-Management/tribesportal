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

  const isMobileView = useIsMobile();
  // Mobile: 32px avatar, Desktop: 28px
  const avatarSize = isMobileView ? 32 : PORTAL_AVATAR.sizeDesktop;

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
            height: avatarSize,
            width: avatarSize,
            minHeight: avatarSize,
            minWidth: avatarSize,
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
        className="w-56 rounded-lg"
        style={{
          backgroundColor: 'var(--tribes-header-bg)',
          borderColor: 'var(--tribes-border)',
        }}
        sideOffset={8}
      >
        <div className="px-3 py-2.5">
          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--tribes-fg)' }}>
            {profile?.full_name || profile?.email}
          </p>
          {profile?.email && profile?.full_name && (
            <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--tribes-fg-muted)' }}>
              {profile.email}
            </p>
          )}
          <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--tribes-fg-muted)' }}>
            {NAV_LABELS.SYSTEM_CONSOLE}
          </p>
        </div>
        
        <DropdownMenuSeparator style={{ backgroundColor: 'var(--tribes-border)' }} />
        
        <DropdownMenuItem
          onClick={() => navigate("/account")}
          className="text-[13px] py-2 focus:bg-white/5"
          style={{ color: 'var(--tribes-fg-secondary)' }}
        >
          <Settings size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2 opacity-70" />
          {NAV_LABELS.ACCOUNT_SETTINGS}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator style={{ backgroundColor: 'var(--tribes-border)' }} />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-[13px] py-2 text-red-400 focus:bg-white/5 focus:text-red-300"
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

        {/* Right: Enter Workspace button + Account */}
        <div className="flex items-center gap-3 shrink-0">
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
          
          <ConsoleAccountMenu />
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
