import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Settings, Shield, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  AVATAR_BUTTON_CLASSES,
  NAV_BUTTON_CLASSES,
  NAV_BUTTON_ACTIVE,
  NAV_BUTTON_INACTIVE,
  ICON_SIZE,
  ICON_STROKE,
} from "@/styles/tokens";

/**
 * GlobalHeader - Premium Tribes header
 * 
 * Layout: 
 * - Left: "Tribes" wordmark
 * - Center: Tenant selector (desktop) or mobile controls
 * - Right: Portal nav (Client Portal | Licensing) + Account menu
 * 
 * Rules:
 * - NO "Tribes Platform" text anywhere
 * - Admin access is inside profile dropdown only
 * - Icons: 18px, strokeWidth 1.5
 * - Avatar: 32px, subtle focus ring
 * - Light mode only
 */


type PortalMode = "publishing" | "licensing";

function useCurrentMode(): PortalMode | "admin" {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return "admin";
  if (location.pathname.includes("/licensing")) return "licensing";
  return "publishing";
}

// Tenant selector dropdown
function TenantSelector() {
  const { tenantMemberships, activeTenant, setActiveTenant, activeContext } = useAuth();
  const navigate = useNavigate();
  const currentMode = useCurrentMode();

  if (tenantMemberships.length <= 1) {
    if (activeTenant) {
      return (
        <span className="text-[13px] font-medium text-neutral-500 truncate max-w-[160px]">
          {activeTenant.tenant_name}
        </span>
      );
    }
    return null;
  }

  const handleTenantChange = (tenantId: string) => {
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
    <Select
      value={activeTenant?.tenant_id ?? ""}
      onValueChange={handleTenantChange}
    >
      <SelectTrigger className="h-7 w-auto min-w-[100px] max-w-[180px] border-0 bg-transparent hover:bg-neutral-100 text-[13px] gap-1.5 px-2 font-medium shadow-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-black/15 text-neutral-500">
        <SelectValue placeholder="Select tenant" />
      </SelectTrigger>
      <SelectContent align="center" className="bg-white border-neutral-200/80">
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
  );
}

// Premium account menu - 32px avatar with Apple-like subtle styling
function AccountMenu() {
  const { 
    profile, 
    signOut, 
    activeContext,
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={AVATAR_BUTTON_CLASSES}
          aria-label="Account menu"
        >
          {getInitials()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 rounded-xl border-neutral-200/80"
        sideOffset={8}
      >
        <div className="px-3 py-2.5">
          <p className="text-[13px] font-medium text-foreground truncate">
            {profile?.full_name || profile?.email}
          </p>
          {profile?.email && profile?.full_name && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {profile.email}
            </p>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Admin link - only for platform admins */}
        {isPlatformAdmin && (
          <DropdownMenuItem
            onClick={() => navigate("/admin")}
            className={cn("text-[13px] py-2", currentMode === "admin" && "bg-muted")}
          >
            <Shield size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2" />
            Administration
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => {
            if (currentMode === "admin") {
              navigate("/admin/settings");
            } else {
              navigate(`/app/${activeContext}/settings`);
            }
          }}
          className="text-[13px] py-2"
        >
          <Settings size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2" />
          Account Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-[13px] py-2 text-destructive focus:text-destructive"
        >
          <LogOut size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile header controls
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
    if (currentMode === "admin") return "Admin";
    if (currentMode === "licensing") return "Licensing";
    return "Client Portal";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[13px] font-medium">
          {getModeLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-52 bg-popover">
        {activeTenant && (
          <div className="px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Organization</p>
            <p className="text-[13px] font-medium truncate">{activeTenant.tenant_name}</p>
          </div>
        )}
        
        {tenantMemberships.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wide font-normal">
              Switch Organization
            </DropdownMenuLabel>
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
        
        {currentMode !== "admin" && availableContexts.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wide font-normal">
              Switch Portal
            </DropdownMenuLabel>
            
            {availableContexts.includes("publishing") && (
              <DropdownMenuItem
                onClick={() => {
                  setActiveContext("publishing");
                  navigate("/app/publishing");
                }}
                className={cn("text-[13px]", currentMode === "publishing" && "bg-muted")}
              >
                Client Portal
              </DropdownMenuItem>
            )}
            {availableContexts.includes("licensing") && (
              <DropdownMenuItem
                onClick={() => {
                  setActiveContext("licensing");
                  navigate("/app/licensing");
                }}
                className={cn("text-[13px]", currentMode === "licensing" && "bg-muted")}
              >
                Licensing
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
  const { activeContext, availableContexts, setActiveContext } = useAuth();

  const handleLogoClick = () => {
    if (currentMode === "admin") {
      navigate("/admin");
    } else {
      navigate(`/app/${activeContext}`);
    }
  };

  const hasPublishing = availableContexts.includes("publishing");
  const hasLicensing = availableContexts.includes("licensing");

  return (
    <header className="h-14 border-b border-neutral-200/60 bg-white px-4 md:px-6 flex items-center shrink-0 sticky top-0 z-40">
      {/* Left: Wordmark only */}
      <div className="flex items-center min-w-0">
        <button
          onClick={handleLogoClick}
          className="text-[15px] font-semibold text-neutral-900 tracking-[-0.01em] hover:text-neutral-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2 rounded"
        >
          Tribes
        </button>
      </div>

      {/* Center: Tenant (desktop) or Mobile Controls */}
      <div className="flex-1 flex items-center justify-center">
        {!isMobile ? (
          <TenantSelector />
        ) : (
          <MobileControls />
        )}
      </div>

      {/* Right: Portal nav links + Account menu */}
      <div className="flex items-center gap-1">
        {/* Portal navigation as links - desktop only */}
        {!isMobile && currentMode !== "admin" && (
          <nav className="flex items-center gap-1 mr-3">
            {hasPublishing && (
              <button
                onClick={() => {
                  setActiveContext("publishing");
                  navigate("/app/publishing");
                }}
                className={cn(
                  NAV_BUTTON_CLASSES,
                  currentMode === "publishing" ? NAV_BUTTON_ACTIVE : NAV_BUTTON_INACTIVE
                )}
              >
                Client Portal
              </button>
            )}
            {hasLicensing && (
              <button
                onClick={() => {
                  setActiveContext("licensing");
                  navigate("/app/licensing");
                }}
                className={cn(
                  NAV_BUTTON_CLASSES,
                  currentMode === "licensing" ? NAV_BUTTON_ACTIVE : NAV_BUTTON_INACTIVE
                )}
              >
                Licensing
              </button>
            )}
          </nav>
        )}
        
        <AccountMenu />
      </div>
    </header>
  );
}
