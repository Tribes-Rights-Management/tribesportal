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
    // Display tenant name as static text
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
      // Check if current context is still available
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
      <SelectTrigger className="h-8 w-auto min-w-[100px] max-w-[180px] border-border bg-transparent hover:bg-muted text-[13px] gap-1.5 px-3 font-medium">
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

  // Build mode options
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

  // If only one mode (non-admin), hide switcher
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
    <div className="flex items-center h-8 p-0.5 bg-muted rounded-lg">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => handleModeSwitch(mode.key)}
          className={cn(
            "h-7 px-3 text-[13px] font-medium rounded-md transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
            currentMode === mode.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
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

  const getModeLabel = () => {
    switch (currentMode) {
      case "admin": return "Administration";
      case "licensing": return "Licensing Portal";
      default: return "Publishing Portal";
    }
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
      <DropdownMenuContent align="end" className="w-64">
        {/* User info */}
        <div className="px-3 py-2">
          <p className="text-[13px] font-medium text-foreground truncate">
            {profile?.full_name || profile?.email}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {getModeLabel()}
          </p>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Standard menu items */}
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
          Account Settings
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
        <Button variant="outline" size="sm" className="h-8 px-3 text-[13px]">
          {currentMode === "admin" ? "Admin" : currentMode === "licensing" ? "Licensing" : "Publishing"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        {/* Current tenant */}
        {activeTenant && (
          <div className="px-3 py-2 bg-muted/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tenant</p>
            <p className="text-[13px] font-medium truncate">{activeTenant.tenant_name}</p>
          </div>
        )}
        
        {/* Tenant switching */}
        {tenantMemberships.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wide font-normal">
              Switch Tenant
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
        
        {/* Mode switching */}
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
    <header className="h-14 border-b border-border bg-background px-4 md:px-6 flex items-center">
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
      <div className="flex-1 flex items-center justify-center gap-3">
        {!isMobile ? (
          <>
            <TenantSelector />
            <div className="h-4 w-px bg-border" />
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
