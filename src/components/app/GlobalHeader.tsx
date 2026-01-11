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
import { User, LogOut, Settings, HelpCircle, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type AppMode = "publishing" | "licensing" | "admin";

function useCurrentMode(): AppMode {
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
        <span className="text-[13px] font-medium text-foreground truncate max-w-[160px]">
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
      <SelectTrigger className="h-7 w-auto min-w-[100px] max-w-[180px] border-0 bg-transparent hover:bg-muted text-[13px] gap-1.5 px-2 font-medium shadow-none focus:ring-0">
        <SelectValue placeholder="Select tenant" />
      </SelectTrigger>
      <SelectContent align="center">
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

// Mode switcher (Publishing | Licensing | Admin)
function ModeSwitcher() {
  const { availableContexts, isPlatformAdmin, setActiveContext } = useAuth();
  const navigate = useNavigate();
  const currentMode = useCurrentMode();

  const modes: { key: AppMode; label: string }[] = [];
  
  if (availableContexts.includes("publishing")) {
    modes.push({ key: "publishing", label: "Publishing" });
  }
  if (availableContexts.includes("licensing")) {
    modes.push({ key: "licensing", label: "Licensing" });
  }
  if (isPlatformAdmin) {
    modes.push({ key: "admin", label: "Admin" });
  }

  if (modes.length <= 1 && !isPlatformAdmin) return null;

  const handleModeSwitch = (mode: AppMode) => {
    if (mode === currentMode) return;
    
    if (mode === "admin") {
      navigate("/admin");
    } else {
      setActiveContext(mode);
      navigate(`/app/${mode}`);
    }
  };

  return (
    <div className="flex items-center">
      {modes.map((mode, index) => (
        <button
          key={mode.key}
          onClick={() => handleModeSwitch(mode.key)}
          className={cn(
            "h-7 px-3 text-[13px] font-medium transition-colors duration-200",
            currentMode === mode.key
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
            index > 0 && "border-l border-border"
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

// Account menu
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full bg-muted hover:bg-muted/80 shrink-0"
        >
          <User className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
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
        
        <DropdownMenuItem
          onClick={() => {
            if (currentMode === "admin") {
              navigate("/admin/settings");
            } else {
              navigate(`/app/${activeContext}/settings`);
            }
          }}
          className="text-[13px]"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem className="text-[13px]">
          <HelpCircle className="mr-2 h-4 w-4" />
          Support
        </DropdownMenuItem>
        
        {isPlatformAdmin && currentMode !== "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/admin")}
              className="text-[13px]"
            >
              <Shield className="mr-2 h-4 w-4" />
              Administration
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-[13px] text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
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
    isPlatformAdmin,
    setActiveTenant,
    setActiveContext 
  } = useAuth();
  const navigate = useNavigate();
  const currentMode = useCurrentMode();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[13px] font-medium">
          {currentMode === "admin" ? "Admin" : currentMode === "licensing" ? "Licensing" : "Publishing"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-52">
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
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wide font-normal">
          Switch Mode
        </DropdownMenuLabel>
        
        {availableContexts.includes("publishing") && (
          <DropdownMenuItem
            onClick={() => {
              setActiveContext("publishing");
              navigate("/app/publishing");
            }}
            className={cn("text-[13px]", currentMode === "publishing" && "bg-muted")}
          >
            Publishing
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
        {isPlatformAdmin && (
          <DropdownMenuItem
            onClick={() => navigate("/admin")}
            className={cn("text-[13px]", currentMode === "admin" && "bg-muted")}
          >
            Admin
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GlobalHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentMode = useCurrentMode();
  const { activeContext } = useAuth();

  const handleLogoClick = () => {
    if (currentMode === "admin") {
      navigate("/admin");
    } else {
      navigate(`/app/${activeContext}`);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-background px-4 md:px-6 flex items-center shrink-0">
      {/* Left: Wordmark */}
      <div className="flex items-center min-w-0">
        <button
          onClick={handleLogoClick}
          className="text-[15px] font-semibold text-foreground tracking-[-0.01em] hover:text-muted-foreground transition-colors duration-200"
        >
          Tribes
        </button>
      </div>

      {/* Center: Tenant + Mode Switcher */}
      <div className="flex-1 flex items-center justify-center gap-2">
        {!isMobile ? (
          <>
            <TenantSelector />
            <span className="text-muted-foreground/50">·</span>
            <ModeSwitcher />
          </>
        ) : (
          <MobileControls />
        )}
      </div>

      {/* Right: Account menu */}
      <div className="flex items-center">
        <AccountMenu />
      </div>
    </header>
  );
}
