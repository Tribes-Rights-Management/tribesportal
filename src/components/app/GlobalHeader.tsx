import { useAuth } from "@/contexts/AuthContext";
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
import { LogOut, Settings, Shield, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { NAV_LABELS, ICON_SIZE, ICON_STROKE, PORTAL_TYPOGRAPHY, PORTAL_AVATAR } from "@/styles/tokens";

/**
 * GLOBAL HEADER — INSTITUTIONAL SYSTEM NAVIGATION (CANONICAL)
 * 
 * Design Rules:
 * - Single-height, fixed, no shadows, no translucency
 * - Background matches marketing dark header (#0A0A0B)
 * - Brand wordmark only (no slogan)
 * - Navigation is functional, not expressive
 * - Active state is typographic (opacity), not color-heavy
 * - No pills, chips, or floating nav
 * - Minimal indicator for account (initials), no avatar personality
 */

type PortalMode = "publishing" | "licensing";

function useCurrentMode(): PortalMode | "admin" {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return "admin";
  if (location.pathname.includes("/licensing")) return "licensing";
  return "publishing";
}

// Tenant selector - flat, dark theme
function TenantSelector() {
  const { tenantMemberships, activeTenant, setActiveTenant, activeContext } = useAuth();
  const navigate = useNavigate();
  const currentMode = useCurrentMode();

  if (tenantMemberships.length <= 1) {
    if (activeTenant) {
      return (
        <span className="text-[13px] font-medium text-white/50 truncate max-w-[160px]">
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
      <SelectTrigger className="h-7 w-auto min-w-[100px] max-w-[180px] border-0 bg-transparent hover:bg-white/5 text-[13px] gap-1.5 px-2 font-medium shadow-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-white/20 text-white/50">
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent align="center" className="bg-[#1A1A1B] border-white/10 text-white">
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
  );
}

// Account menu - institutional, dark theme
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
        
        {/* Admin link - platform admins only */}
        {isPlatformAdmin && (
          <DropdownMenuItem
            onClick={() => navigate("/admin")}
            className={cn(
              "text-[13px] py-2 text-white/70 focus:bg-white/10 focus:text-white",
              currentMode === "admin" && "bg-white/5"
            )}
          >
            <Shield size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2 opacity-70" />
            {NAV_LABELS.ADMINISTRATION}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem
          onClick={() => {
            if (currentMode === "admin") {
              navigate("/admin/settings");
            } else {
              navigate(`/app/${activeContext}/settings`);
            }
          }}
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
    if (currentMode === "admin") return NAV_LABELS.ADMINISTRATION;
    if (currentMode === "licensing") return NAV_LABELS.LICENSING;
    return NAV_LABELS.CLIENT_PORTAL;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 px-2 text-[13px] font-medium text-white/70 hover:text-white/90 flex items-center gap-1">
          {getModeLabel()}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-52 bg-[#1A1A1B] border-white/10 text-white">
        {activeTenant && (
          <div className="px-3 py-2">
            <p className="text-[10px] text-white/40 uppercase tracking-wide">Organization</p>
            <p className="text-[13px] font-medium text-white/80 truncate">{activeTenant.tenant_name}</p>
          </div>
        )}
        
        {tenantMemberships.length > 1 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="px-3 py-1">
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Switch Organization</p>
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
        
        {currentMode !== "admin" && availableContexts.length > 1 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="px-3 py-1">
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Switch Portal</p>
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
                {NAV_LABELS.CLIENT_PORTAL}
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
    <header 
      className="h-14 border-b border-white/8 px-4 md:px-6 flex items-center shrink-0 sticky top-0 z-40"
      style={{ backgroundColor: '#0A0A0B' }}
    >
      {/* Left: Wordmark - functional, not expressive */}
      <div className="flex items-center min-w-0">
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
      </div>

      {/* Center: Tenant selector */}
      <div className="flex-1 flex items-center justify-center">
        {!isMobile ? (
          <TenantSelector />
        ) : (
          <MobileControls />
        )}
      </div>

      {/* Right: Portal nav + Account */}
      <div className="flex items-center gap-1">
        {/* Portal navigation - flat, typographic active state */}
        {!isMobile && currentMode !== "admin" && (
          <nav className="flex items-center gap-1 mr-3">
            {hasPublishing && (
              <button
                onClick={() => {
                  setActiveContext("publishing");
                  navigate("/app/publishing");
                }}
                className={cn(
                  "h-7 px-3 rounded text-[13px] font-medium transition-opacity duration-[180ms]",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30",
                  currentMode === "publishing" 
                    ? "text-white" 
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {NAV_LABELS.CLIENT_PORTAL}
              </button>
            )}
            {hasLicensing && (
              <button
                onClick={() => {
                  setActiveContext("licensing");
                  navigate("/app/licensing");
                }}
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
