import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { NAV_LABELS, PORTAL_TYPOGRAPHY } from "@/styles/tokens";
import { NotificationCenter } from "./NotificationCenter";

/**
 * GLOBAL HEADER — ORGANIZATION WORKSPACE NAVIGATION
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER ENFORCEMENT DIRECTIVE — LOCKED ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * HIERARCHY (TWO LAYERS ONLY):
 * 
 * 1) COMPANY LAYER (NOT A WORKSPACE):
 *    • System Console — accessed via user/profile menu ONLY
 *    • NO workspace selector in System Console
 *    • NO product navigation in System Console
 * 
 * 2) WORKSPACE LAYER (OPERATING ENVIRONMENTS):
 *    • Tribes Team — internal operations
 *    • Licensing — external licensees
 *    • Tribes Admin — administration clients
 *    • Products appear ONLY within workspaces
 *    • Workspace switcher NEVER lists System Console
 * 
 * WORKSPACE ENTRY TRANSITION:
 * - Header subtitle changes from "SYSTEM CONSOLE" to "WORKSPACE · {Context}"
 * - Navigation structure changes (sidebar appears)
 * - Exit affordance: "← Return to System Console" in user menu
 * 
 * NAVIGATION RULES:
 * - Company Console ≠ Organization Workspace
 * - Products appear ONLY within organizations
 * - Organization switcher NEVER lists company-level consoles
 * - This architecture is enforced across desktop and mobile views
 * - Mobile: one primary action per screen, no hover-only actions
 * 
 * ROLE-BASED VISIBILITY:
 * - platform_owner: System Console (in dropdown) + Workspace products
 * - external_auditor: Read-only audit access (no products)
 * - tribes_team_*: Tribes Team workspace
 * - licensing_user: Licensing workspace
 * - portal_client_*: Tribes Admin workspace
 * ═══════════════════════════════════════════════════════════════════════════
 */

type PortalMode = "publishing" | "licensing" | "portal" | "admin" | "auditor";

function useCurrentMode(): PortalMode {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return "admin";
  if (location.pathname.startsWith("/auditor")) return "auditor";
  if (location.pathname.startsWith("/licensing")) return "licensing";
  if (location.pathname.startsWith("/portal")) return "portal";
  if (location.pathname.includes("/licensing")) return "licensing";
  return "publishing";
}

// Get context label for header subtitle
function getContextLabel(mode: PortalMode): string {
  switch (mode) {
    case "licensing": return "Licensing";
    case "portal": return "Tribes Admin";
    case "publishing": return "Publishing";
    default: return "";
  }
}

/**
 * WORKSPACE SELECTOR — ORGANIZATION-SCOPED ONLY
 * 
 * RULES (LOCKED):
 * - Lists ONLY operating workspaces (organizations)
 * - NEVER lists System Console or company-level surfaces
 * - Switching workspaces changes data scope everywhere
 * - Label: "Workspace" (not "Organization")
 * - Helper: "Workspaces represent separate operating environments"
 * - Never implies product or account switching
 */
function WorkspaceSelector() {
  const { tenantMemberships, activeTenant, setActiveTenant, activeContext } = useAuth();
  const navigate = useNavigate();
  const currentMode = useCurrentMode();

  // Single workspace: show as static label (no selector needed)
  if (tenantMemberships.length <= 1) {
    if (activeTenant) {
      return (
        <div className="flex flex-col items-center">
          <span 
            className="text-[10px] uppercase tracking-wider"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            Workspace
          </span>
          <span 
            className="text-[13px] font-medium truncate max-w-[160px]"
            style={{ color: 'var(--tribes-text-secondary)' }}
          >
            {activeTenant.tenant_name}
          </span>
        </div>
      );
    }
    return null;
  }

  const handleWorkspaceChange = (tenantId: string) => {
    setActiveTenant(tenantId);
    const newTenant = tenantMemberships.find(m => m.tenant_id === tenantId);
    if (newTenant && currentMode !== "admin") {
      if (activeContext && newTenant.allowed_contexts.includes(activeContext)) {
        navigate(`/app/${activeContext}`);
      } else if (newTenant.allowed_contexts.length > 0) {
        const newContext = newTenant.allowed_contexts.includes("publishing") 
          ? "publishing" 
          : newTenant.allowed_contexts[0];
        navigate(`/app/${newContext}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span 
        className="text-[10px] uppercase tracking-wider"
        style={{ color: 'var(--tribes-text-muted)' }}
      >
        Workspace
      </span>
      <Select
        value={activeTenant?.tenant_id ?? ""}
        onValueChange={handleWorkspaceChange}
      >
        <SelectTrigger 
          className="h-7 w-auto min-w-[100px] max-w-[180px] border-0 bg-transparent hover:bg-white/5 text-[13px] gap-1.5 px-2 font-medium shadow-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-white/20"
          style={{ color: 'var(--tribes-text-secondary)' }}
        >
          <SelectValue placeholder={NAV_LABELS.SELECT_WORKSPACE} />
        </SelectTrigger>
        <SelectContent align="center" className="bg-[var(--tribes-header-bg)] border-[var(--tribes-border)]">
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--tribes-border)' }}>
            <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--tribes-text-muted)' }}>
              Switch Workspace
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--tribes-text-muted)' }}>
              Workspaces represent separate operating environments
            </p>
          </div>
          {tenantMemberships.map((membership) => (
            <SelectItem
              key={membership.tenant_id}
              value={membership.tenant_id}
              className="text-[13px] focus:bg-white/10"
              style={{ color: 'var(--tribes-text-secondary)' }}
            >
              {membership.tenant_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Account menu wrapper - uses shared ProfileDropdown with dark theme for GlobalHeader
function AccountMenu() {
  const { isPlatformAdmin } = useAuth();
  const currentMode = useCurrentMode();
  const showReturnToConsole = isPlatformAdmin && currentMode !== "admin";
  const showSystemConsole = isPlatformAdmin && currentMode === "admin";
  
  return (
    <ProfileDropdown
      avatarVariant="dark"
      showReturnToConsole={showReturnToConsole}
      showSystemConsole={showSystemConsole}
    />
  );
}

// Mobile controls - compact, dark theme
function MobileControls() {
  const { 
    activeTenant, 
    availableContexts, 
    tenantMemberships, 
    setActiveTenant,
    setActiveContext 
  } = useAuth();
  const navigate = useNavigate();
  const currentMode = useCurrentMode();

  const getModeLabel = () => {
    if (currentMode === "admin") return NAV_LABELS.SYSTEM_CONSOLE;
    if (currentMode === "licensing") return NAV_LABELS.LICENSING;
    return NAV_LABELS.TRIBES_ADMIN;
  };

  // No products without active workspace
  const hasActiveWorkspace = !!activeTenant;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="h-7 px-2 text-[13px] font-medium flex items-center gap-1 hover:opacity-80"
          style={{ color: 'var(--tribes-text-secondary)' }}
        >
          {hasActiveWorkspace ? getModeLabel() : "Select Workspace"}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="center" 
        className="w-52"
        style={{
          backgroundColor: 'var(--tribes-header-bg)',
          borderColor: 'var(--tribes-border)',
        }}
      >
        {activeTenant && (
          <div className="px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--tribes-text-muted)' }}>Active Workspace</p>
            <p className="text-[13px] font-medium truncate" style={{ color: 'var(--tribes-text-secondary)' }}>{activeTenant.tenant_name}</p>
          </div>
        )}
        
        {tenantMemberships.length > 1 && (
          <>
            <DropdownMenuSeparator style={{ backgroundColor: 'var(--tribes-border)' }} />
            <div className="px-3 py-1">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--tribes-text-muted)' }}>Switch Workspace</p>
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--tribes-text-muted)' }}>
                Workspaces are separate environments
              </p>
            </div>
            {tenantMemberships.map((membership) => (
              <DropdownMenuItem
                key={membership.tenant_id}
                onClick={() => {
                  setActiveTenant(membership.tenant_id);
                  if (currentMode !== "admin") {
                    const ctx = membership.allowed_contexts[0];
                    if (ctx) navigate(`/app/${ctx}`);
                  }
                }}
                className={cn(
                  "text-[13px] focus:bg-white/5",
                  activeTenant?.tenant_id === membership.tenant_id && "bg-white/[0.02]"
                )}
                style={{ color: 'var(--tribes-text-secondary)' }}
              >
                {membership.tenant_name}
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {/* Products only available with active workspace */}
        {hasActiveWorkspace && currentMode !== "admin" && availableContexts.length > 1 && (
          <>
            <DropdownMenuSeparator style={{ backgroundColor: 'var(--tribes-border)' }} />
            <div className="px-3 py-1">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--tribes-text-muted)' }}>Products</p>
            </div>
            
            {availableContexts.includes("publishing") && (
              <DropdownMenuItem
                onClick={() => {
                  setActiveContext("publishing");
                  navigate("/app/publishing");
                }}
                className={cn(
                  "text-[13px] focus:bg-white/5",
                  currentMode === "publishing" && "bg-white/[0.02]"
                )}
                style={{ color: 'var(--tribes-text-secondary)' }}
              >
                {NAV_LABELS.TRIBES_ADMIN}
              </DropdownMenuItem>
            )}
            {availableContexts.includes("licensing") && (
              <DropdownMenuItem
                onClick={() => {
                  setActiveContext("licensing");
                  navigate("/app/licensing");
                }}
                className={cn(
                  "text-[13px] focus:bg-white/5",
                  currentMode === "licensing" && "bg-white/[0.02]"
                )}
                style={{ color: 'var(--tribes-text-secondary)' }}
              >
                {NAV_LABELS.LICENSING}
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GlobalHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentMode = useCurrentMode();
  const { activeContext, activeTenant, isPlatformAdmin } = useAuth();
  const { canAccessLicensing, canAccessPortal } = useRoleAccess();

  const handleLogoClick = () => {
    if (currentMode === "admin") {
      navigate("/admin");
    } else if (currentMode === "portal") {
      navigate("/portal");
    } else if (currentMode === "licensing") {
      navigate("/licensing");
    } else {
      navigate(`/app/${activeContext}`);
    }
  };

  // Products require active workspace - ARCHITECTURAL RULE
  const hasActiveWorkspace = !!activeTenant;
  
  // Module visibility based on permissions AND active workspace
  const showPortal = hasActiveWorkspace && (isPlatformAdmin || canAccessPortal);
  const showLicensing = hasActiveWorkspace && (isPlatformAdmin || canAccessLicensing);

  // Get context label for header subtitle
  const contextLabel = getContextLabel(currentMode);

  // Mobile: Two-row layout with CSS Grid
  if (isMobile) {
    return (
      <header 
        className="shrink-0 sticky top-0 z-40 w-full max-w-full overflow-x-clip"
        style={{ 
          backgroundColor: 'var(--app-header-bg)',
          borderBottom: '1px solid var(--app-chrome-border)',
        }}
      >
        {/* Mobile Grid Layout: 2 rows */}
        <div 
          className="grid gap-0 w-full max-w-full"
          style={{
            gridTemplateRows: 'auto auto',
          }}
        >
          {/* Row 1: Wordmark + Avatar */}
          <div 
            className="flex items-center justify-between w-full"
            style={{ 
              minHeight: '48px',
              paddingTop: '12px',
              paddingBottom: '8px',
              paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
              paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
            }}
          >
            {/* Left: Wordmark */}
            <button
              onClick={handleLogoClick}
              className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded uppercase shrink-0"
              style={{
                fontSize: '11px',
                letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
                color: 'var(--foreground)',
              }}
            >
            {NAV_LABELS.BRAND_WORDMARK}
            </button>

            {/* Right: Notifications + Avatar */}
            <div className="flex items-center gap-2 shrink-0">
              <NotificationCenter />
              <AccountMenu />
            </div>
          </div>

          {/* Row 2: Context label + Mobile controls */}
          <div 
            className="flex items-center justify-between w-full"
            style={{ 
              minHeight: '44px',
              paddingTop: '4px',
              paddingBottom: '12px',
              paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
              paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
            }}
          >
            {/* Left: Context label */}
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
              {hasActiveWorkspace && contextLabel && (
                <span 
                  className="text-[11px] font-medium uppercase tracking-wider truncate"
                  style={{ color: 'var(--tribes-text-muted)' }}
                >
                  {contextLabel}
                </span>
              )}
              {!hasActiveWorkspace && (
                <span 
                  className="text-[11px] font-medium uppercase tracking-wider truncate"
                  style={{ color: 'var(--tribes-text-muted)' }}
                >
                  Select Workspace
                </span>
              )}
            </div>

            {/* Right: Mobile workspace/product selector */}
            <MobileControls />
          </div>
        </div>
      </header>
    );
  }

  // Desktop: Single-row layout
  return (
    <header 
      className="h-14 border-b flex items-center shrink-0 sticky top-0 z-40 w-full max-w-full overflow-x-clip"
      style={{ 
        backgroundColor: 'var(--app-header-bg)',
        borderColor: 'var(--app-chrome-border)',
        paddingLeft: 'max(24px, env(safe-area-inset-left, 24px))',
        paddingRight: 'max(24px, env(safe-area-inset-right, 24px))',
      }}
    >
      {/* Left: Wordmark + Context indicator */}
      <div className="flex items-center min-w-0 gap-3">
        <button
          onClick={handleLogoClick}
          className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded uppercase"
          style={{
            fontSize: PORTAL_TYPOGRAPHY.brandWordmark.size,
            letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
            color: 'var(--foreground)',
          }}
        >
          {NAV_LABELS.BRAND_WORDMARK}
        </button>
        
        {/* Header subtitle - shows workspace context when active */}
        {hasActiveWorkspace && contextLabel && (
          <div className="flex items-center gap-1.5">
            <span style={{ color: 'var(--tribes-text-muted)' }}>·</span>
            <span 
              className="text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--tribes-text-muted)' }}
            >
              {contextLabel}
            </span>
          </div>
        )}
      </div>

      {/* Center: Workspace selector - organization-scoped */}
      <div className="flex-1 flex items-center justify-center">
        <WorkspaceSelector />
      </div>

      {/* Right: Module nav + Account */}
      <div className="flex items-center gap-1">
        {/* Product navigation - ONLY visible with active workspace */}
        {currentMode !== "admin" && (
          <nav className="flex items-center gap-1 mr-3">
            {/* Tribes Admin (was Client Portal) - organization-scoped */}
            {showPortal && (
              <button
                onClick={() => navigate("/portal")}
                className={cn(
                  "h-8 px-3 rounded-lg text-[13px] font-medium transition-colors duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]",
                  (currentMode === "portal" || currentMode === "publishing")
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {NAV_LABELS.TRIBES_ADMIN}
              </button>
            )}
            {/* Licensing - organization-scoped */}
            {showLicensing && (
              <button
                onClick={() => navigate("/licensing")}
                className={cn(
                  "h-8 px-3 rounded-lg text-[13px] font-medium transition-colors duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]",
                  currentMode === "licensing"
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {NAV_LABELS.LICENSING}
              </button>
            )}
          </nav>
        )}
        
        <NotificationCenter />
        <AccountMenu />
      </div>
    </header>
  );
}
