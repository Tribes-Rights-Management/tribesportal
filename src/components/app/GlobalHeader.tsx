import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
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
import { LogOut, Settings, Shield, ChevronDown, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { NAV_LABELS, ICON_SIZE, ICON_STROKE, PORTAL_TYPOGRAPHY, PORTAL_AVATAR } from "@/styles/tokens";

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
            style={{ color: 'var(--tribes-fg-muted)' }}
          >
            Workspace
          </span>
          <span 
            className="text-[13px] font-medium truncate max-w-[160px]"
            style={{ color: 'var(--tribes-fg-secondary)' }}
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
        style={{ color: 'var(--tribes-fg-muted)' }}
      >
        Workspace
      </span>
      <Select
        value={activeTenant?.tenant_id ?? ""}
        onValueChange={handleWorkspaceChange}
      >
        <SelectTrigger className="h-7 w-auto min-w-[100px] max-w-[180px] border-0 bg-transparent hover:bg-white/5 text-[13px] gap-1.5 px-2 font-medium shadow-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-white/20 text-white/60">
          <SelectValue placeholder={NAV_LABELS.SELECT_WORKSPACE} />
        </SelectTrigger>
        <SelectContent align="center" className="bg-[#1A1A1B] border-white/10 text-white">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-[10px] text-white/40 uppercase tracking-wide">
              Switch Workspace
            </p>
            <p className="text-[11px] text-white/30 mt-0.5">
              Workspaces represent separate operating environments
            </p>
          </div>
          {tenantMemberships.map((membership) => (
            <SelectItem
              key={membership.tenant_id}
              value={membership.tenant_id}
              className="text-[13px] text-white/80 focus:bg-white/10 focus:text-white"
            >
              {membership.tenant_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Account menu - institutional, dark theme
function AccountMenu() {
  const { 
    profile, 
    signOut, 
    isPlatformAdmin,
  } = useAuth();
  const navigate = useNavigate();
  const currentMode = useCurrentMode();

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

  // Show "Return to System Console" when in a workspace (not admin mode)
  const showReturnToConsole = isPlatformAdmin && currentMode !== "admin";

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
        </div>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        {/* Return to System Console - shown when in workspace */}
        {showReturnToConsole && (
          <>
            <DropdownMenuItem
              onClick={() => navigate("/admin")}
              className="text-[13px] py-2 text-white/70 focus:bg-white/10 focus:text-white"
            >
              <ArrowLeft size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2 opacity-70" />
              Return to System Console
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        )}
        
        {/* System Console link - only in admin mode for completeness */}
        {isPlatformAdmin && currentMode === "admin" && (
          <DropdownMenuItem
            onClick={() => navigate("/admin")}
            className="text-[13px] py-2 text-white/70 focus:bg-white/10 focus:text-white bg-white/5"
          >
            <Shield size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2 opacity-70" />
            {NAV_LABELS.SYSTEM_CONSOLE}
          </DropdownMenuItem>
        )}
        
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
        <button className="h-7 px-2 text-[13px] font-medium text-white/70 hover:text-white/90 flex items-center gap-1">
          {hasActiveWorkspace ? getModeLabel() : "Select Workspace"}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-52 bg-[#1A1A1B] border-white/10 text-white">
        {activeTenant && (
          <div className="px-3 py-2">
            <p className="text-[10px] text-white/40 uppercase tracking-wide">Active Workspace</p>
            <p className="text-[13px] font-medium text-white/80 truncate">{activeTenant.tenant_name}</p>
          </div>
        )}
        
        {tenantMemberships.length > 1 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="px-3 py-1">
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Switch Workspace</p>
              <p className="text-[9px] text-white/25 mt-0.5">
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
                  "text-[13px] text-white/70 focus:bg-white/10 focus:text-white",
                  activeTenant?.tenant_id === membership.tenant_id && "bg-white/5"
                )}
              >
                {membership.tenant_name}
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {/* Products only available with active workspace */}
        {hasActiveWorkspace && currentMode !== "admin" && availableContexts.length > 1 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="px-3 py-1">
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Products</p>
            </div>
            
            {availableContexts.includes("publishing") && (
              <DropdownMenuItem
                onClick={() => {
                  setActiveContext("publishing");
                  navigate("/app/publishing");
                }}
                className={cn(
                  "text-[13px] text-white/70 focus:bg-white/10 focus:text-white",
                  currentMode === "publishing" && "bg-white/5"
                )}
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
                  "text-[13px] text-white/70 focus:bg-white/10 focus:text-white",
                  currentMode === "licensing" && "bg-white/5"
                )}
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

  return (
    <header 
      className="h-14 border-b px-4 md:px-6 flex items-center shrink-0 sticky top-0 z-40"
      style={{ 
        backgroundColor: 'var(--tribes-header-bg)',
        borderColor: 'var(--tribes-border)',
      }}
    >
      {/* Left: Wordmark + Context indicator */}
      <div className="flex items-center min-w-0 gap-3">
        <button
          onClick={handleLogoClick}
          className="font-semibold text-white hover:text-white/70 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded uppercase"
          style={{
            fontSize: PORTAL_TYPOGRAPHY.brandWordmark.size,
            letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
          }}
        >
          {NAV_LABELS.BRAND_WORDMARK}
        </button>
        
        {/* Header subtitle - shows workspace context when active */}
        {hasActiveWorkspace && contextLabel && !isMobile && (
          <div className="flex items-center gap-1.5">
            <span className="text-white/20">·</span>
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
        {!isMobile ? (
          <WorkspaceSelector />
        ) : (
          <MobileControls />
        )}
      </div>

      {/* Right: Module nav + Account */}
      <div className="flex items-center gap-1">
        {/* Product navigation - ONLY visible with active workspace */}
        {!isMobile && currentMode !== "admin" && (
          <nav className="flex items-center gap-1 mr-3">
            {/* Tribes Admin (was Client Portal) - organization-scoped */}
            {showPortal && (
              <button
                onClick={() => navigate("/portal")}
                className={cn(
                  "h-7 px-3 rounded text-[13px] font-medium transition-opacity duration-[180ms]",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30",
                  (currentMode === "portal" || currentMode === "publishing")
                    ? "text-white" 
                    : "text-white/50 hover:text-white/80"
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
                  "h-7 px-3 rounded text-[13px] font-medium transition-opacity duration-[180ms]",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30",
                  currentMode === "licensing" 
                    ? "text-white" 
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {NAV_LABELS.LICENSING}
              </button>
            )}
          </nav>
        )}
        
        <AccountMenu />
      </div>
    </header>
  );
}
