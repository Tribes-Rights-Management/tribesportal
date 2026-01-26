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
import { ChevronDown, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { NAV_LABELS, PORTAL_TYPOGRAPHY } from "@/styles/tokens";
import { NotificationCenter } from "./NotificationCenter";
import { SidebarHeader, ContentHeader } from "./AppShell";

/**
 * APP HEADER — STRIPE-LIKE UNIFIED TOP BAR (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * GRID-ALIGNED HEADER ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Desktop (showSidebarLogo=true):
 * - Renders in 2-column grid (sidebar column + content column)
 * - Left column: Logo in sidebar-colored region
 * - Right column: Navigation + actions in white region
 * 
 * Mobile (showSidebarLogo=false):
 * - Single full-width header with hamburger menu
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
            style={{ color: 'var(--tribes-fg)' }}
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
          className="h-7 w-auto min-w-[100px] max-w-[180px] border-0 bg-transparent hover:bg-muted/50 text-[13px] gap-1.5 px-2 font-medium shadow-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[#0071E3]"
          style={{ color: 'var(--tribes-fg)' }}
        >
          <SelectValue placeholder={NAV_LABELS.SELECT_WORKSPACE} />
        </SelectTrigger>
        <SelectContent align="center">
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
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
              className="text-[13px]"
            >
              {membership.tenant_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Account menu wrapper - uses shared ProfileDropdown
function AccountMenu() {
  const { isPlatformAdmin } = useAuth();
  const currentMode = useCurrentMode();
  const showReturnToConsole = isPlatformAdmin && currentMode !== "admin";
  const showSystemConsole = isPlatformAdmin && currentMode === "admin";
  
  return (
    <ProfileDropdown
      avatarVariant="default"
      showReturnToConsole={showReturnToConsole}
      showSystemConsole={showSystemConsole}
    />
  );
}

// Mobile controls dropdown
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

  const hasActiveWorkspace = !!activeTenant;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="h-7 px-2 text-[13px] font-medium flex items-center gap-1 hover:opacity-80"
          style={{ color: 'var(--tribes-fg-secondary)' }}
        >
          {hasActiveWorkspace ? getModeLabel() : "Select Workspace"}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-52">
        {activeTenant && (
          <div className="px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Active Workspace</p>
            <p className="text-[13px] font-medium truncate">{activeTenant.tenant_name}</p>
          </div>
        )}
        
        {tenantMemberships.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Switch Workspace</p>
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
                  "text-[13px]",
                  activeTenant?.tenant_id === membership.tenant_id && "bg-muted"
                )}
              >
                {membership.tenant_name}
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {hasActiveWorkspace && currentMode !== "admin" && availableContexts.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Products</p>
            </div>
            
            {availableContexts.includes("publishing") && (
              <DropdownMenuItem
                onClick={() => {
                  setActiveContext("publishing");
                  navigate("/app/publishing");
                }}
                className={cn(
                  "text-[13px]",
                  currentMode === "publishing" && "bg-muted"
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
                  "text-[13px]",
                  currentMode === "licensing" && "bg-muted"
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

interface AppHeaderProps {
  /** Whether to show the sidebar-aligned logo section (desktop grid layout) */
  showSidebarLogo?: boolean;
}

export function AppHeader({ showSidebarLogo = false }: AppHeaderProps) {
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

  const hasActiveWorkspace = !!activeTenant;
  const showPortal = hasActiveWorkspace && (isPlatformAdmin || canAccessPortal);
  const showLicensing = hasActiveWorkspace && (isPlatformAdmin || canAccessLicensing);
  const contextLabel = getContextLabel(currentMode);

  // Mobile: Full-width stacked header
  if (isMobile) {
    return (
      <div 
        className="w-full h-full flex flex-col"
        style={{ 
          paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
          paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
        }}
      >
        <div className="flex-1 flex items-center justify-between">
          {/* Left: Wordmark */}
          <button
            onClick={handleLogoClick}
            className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded uppercase shrink-0"
            style={{
              fontSize: '11px',
              letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
              color: 'var(--tribes-fg)',
            }}
          >
            {NAV_LABELS.BRAND_WORDMARK}
          </button>

          {/* Right: Notifications + Avatar */}
          <div className="flex items-center gap-2 shrink-0">
            <MobileControls />
            <NotificationCenter />
            <AccountMenu />
          </div>
        </div>
      </div>
    );
  }

  // Desktop with sidebar: 2-column grid header
  if (showSidebarLogo) {
    return (
      <>
        {/* Left column: Sidebar-colored logo area */}
        <SidebarHeader
          logo={
            <button
              onClick={handleLogoClick}
              className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded uppercase"
              style={{
                fontSize: PORTAL_TYPOGRAPHY.brandWordmark.size,
                letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
                color: 'var(--tribes-fg)',
              }}
            >
              {NAV_LABELS.BRAND_WORDMARK}
            </button>
          }
        />

        {/* Right column: Content area header */}
        <ContentHeader>
          {/* Left: Context label */}
          <div className="flex items-center gap-3">
            {hasActiveWorkspace && contextLabel && (
              <span 
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'var(--tribes-text-muted)' }}
              >
                {contextLabel}
              </span>
            )}
          </div>

          {/* Center: Workspace selector */}
          <div className="flex-1 flex items-center justify-center">
            <WorkspaceSelector />
          </div>

          {/* Right: Module nav + Account */}
          <div className="flex items-center gap-1">
            {currentMode !== "admin" && (
              <nav className="flex items-center gap-1 mr-3">
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
        </ContentHeader>
      </>
    );
  }

  // Desktop without sidebar: simple full-width header
  return (
    <div 
      className="w-full h-full flex items-center justify-between"
      style={{ 
        paddingLeft: 'max(24px, env(safe-area-inset-left, 24px))',
        paddingRight: 'max(24px, env(safe-area-inset-right, 24px))',
      }}
    >
      {/* Left: Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLogoClick}
          className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded uppercase"
          style={{
            fontSize: PORTAL_TYPOGRAPHY.brandWordmark.size,
            letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
            color: 'var(--tribes-fg)',
          }}
        >
          {NAV_LABELS.BRAND_WORDMARK}
        </button>
        
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

      {/* Center: Workspace selector */}
      <div className="flex-1 flex items-center justify-center">
        <WorkspaceSelector />
      </div>

      {/* Right: Module nav + Account */}
      <div className="flex items-center gap-1">
        {currentMode !== "admin" && (
          <nav className="flex items-center gap-1 mr-3">
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
    </div>
  );
}
