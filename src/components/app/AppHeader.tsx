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
import { User, LogOut, Settings, ChevronDown, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Status indicator for Tenant (non-interactive)
function TenantIndicator({ className }: { className?: string }) {
  const { activeTenant } = useAuth();
  
  if (!activeTenant) return null;
  
  return (
    <span className={cn("text-[11px] text-[#71717A] font-normal whitespace-nowrap", className)}>
      <span className="text-[#A1A1AA]">Tenant:</span>{" "}
      <span className="font-medium text-[#52525B] truncate max-w-[180px] inline-block align-bottom">
        {activeTenant.tenant_name}
      </span>
    </span>
  );
}

// Status indicator for Mode (non-interactive)
function ModeIndicator({ className }: { className?: string }) {
  const { activeContext } = useAuth();
  
  const contextLabel = activeContext === "licensing" ? "Licensing" : "Publishing";
  
  return (
    <span className={cn("text-[11px] text-[#71717A] font-normal whitespace-nowrap", className)}>
      <span className="text-[#A1A1AA]">Mode:</span>{" "}
      <span className="font-medium text-[#52525B]">{contextLabel}</span>
    </span>
  );
}

// Desktop status cluster with divider
function StatusCluster() {
  return (
    <div className="hidden md:flex items-center gap-2">
      <TenantIndicator />
      <span className="text-[#D4D4D8] text-[11px] select-none">·</span>
      <ModeIndicator />
    </div>
  );
}

// Tenant selector control (only shown if multiple tenants)
function TenantControl() {
  const { tenantMemberships, activeTenant, setActiveTenant } = useAuth();

  if (tenantMemberships.length <= 1) return null;

  return (
    <Select
      value={activeTenant?.tenant_id ?? ""}
      onValueChange={setActiveTenant}
    >
      <SelectTrigger className="h-7 w-auto min-w-[120px] max-w-[180px] border-[#E4E4E7] bg-transparent hover:bg-[#F4F4F5] text-[11px] gap-1 px-2">
        <SelectValue placeholder="Switch tenant" />
      </SelectTrigger>
      <SelectContent align="end">
        {tenantMemberships.map((membership) => (
          <SelectItem
            key={membership.tenant_id}
            value={membership.tenant_id}
            className="text-[12px]"
          >
            {membership.tenant_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Mode toggle control (only shown if both contexts available)
function ModeControl() {
  const { activeContext, availableContexts, setActiveContext } = useAuth();

  if (availableContexts.length <= 1) return null;

  return (
    <div className="flex items-center h-7 p-0.5 bg-[#F4F4F5] rounded">
      {availableContexts.map((context) => (
        <button
          key={context}
          onClick={() => setActiveContext(context)}
          className={cn(
            "h-6 px-2.5 text-[11px] font-medium rounded transition-all duration-150",
            activeContext === context
              ? "bg-white text-[#0A0A0A] shadow-sm"
              : "text-[#71717A] hover:text-[#3F3F46]"
          )}
        >
          {context === "licensing" ? "Licensing" : "Publishing"}
        </button>
      ))}
    </div>
  );
}

// Mobile compact status display
function MobileStatusDisplay() {
  const { activeTenant, activeContext } = useAuth();
  
  const contextLabel = activeContext === "licensing" ? "Licensing" : "Publishing";
  const tenantName = activeTenant?.tenant_name ?? "—";
  
  // Truncate long tenant names
  const displayTenant = tenantName.length > 20 
    ? tenantName.substring(0, 18) + "…" 
    : tenantName;
  
  return (
    <div className="flex flex-col items-end gap-0 md:hidden">
      <span className="text-[10px] text-[#71717A] leading-tight">
        <span className="text-[#A1A1AA]">Tenant:</span>{" "}
        <span className="font-medium text-[#52525B]">{displayTenant}</span>
      </span>
      <span className="text-[10px] text-[#71717A] leading-tight">
        <span className="text-[#A1A1AA]">Mode:</span>{" "}
        <span className="font-medium text-[#52525B]">{contextLabel}</span>
      </span>
    </div>
  );
}

// Account menu with mobile controls
function AccountMenu() {
  const { 
    profile, 
    signOut, 
    activeContext, 
    availableContexts, 
    setActiveContext,
    tenantMemberships,
    activeTenant,
    setActiveTenant 
  } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
  };

  const hasMultipleTenants = tenantMemberships.length > 1;
  const hasMultipleContexts = availableContexts.length > 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full bg-[#F4F4F5] hover:bg-[#E4E4E7] shrink-0"
        >
          <User className="h-4 w-4 text-[#71717A]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* User info */}
        <div className="px-3 py-2">
          <p className="text-[13px] font-medium text-[#0A0A0A] truncate">
            {profile?.email}
          </p>
          <p className="text-[11px] text-[#71717A] capitalize mt-0.5">
            {activeContext} Portal
          </p>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Mobile: Show current status at top of menu */}
        {isMobile && (
          <>
            <div className="px-3 py-2 bg-[#FAFAFA]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wide">Tenant</span>
                <span className="text-[11px] text-[#52525B] font-medium truncate max-w-[160px]">
                  {activeTenant?.tenant_name}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wide">Mode</span>
                <span className="text-[11px] text-[#52525B] font-medium capitalize">
                  {activeContext}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Mobile: Tenant switching */}
        {isMobile && hasMultipleTenants && (
          <>
            <DropdownMenuLabel className="text-[10px] text-[#A1A1AA] uppercase tracking-wide font-normal">
              Switch Tenant
            </DropdownMenuLabel>
            {tenantMemberships.map((membership) => (
              <DropdownMenuItem
                key={membership.tenant_id}
                onClick={() => setActiveTenant(membership.tenant_id)}
                className={cn(
                  "text-[12px]",
                  activeTenant?.tenant_id === membership.tenant_id && "bg-[#F4F4F5]"
                )}
              >
                {membership.tenant_name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Mobile: Mode switching */}
        {isMobile && hasMultipleContexts && (
          <>
            <DropdownMenuLabel className="text-[10px] text-[#A1A1AA] uppercase tracking-wide font-normal">
              Switch Mode
            </DropdownMenuLabel>
            {availableContexts.map((context) => (
              <DropdownMenuItem
                key={context}
                onClick={() => setActiveContext(context)}
                className={cn(
                  "text-[12px] capitalize",
                  activeContext === context && "bg-[#F4F4F5]"
                )}
              >
                {context}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Standard menu items */}
        <DropdownMenuItem
          onClick={() => navigate(`/app/${activeContext}/settings`)}
          className="text-[12px]"
        >
          <Settings className="mr-2 h-3.5 w-3.5" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="text-[12px]">
          <HelpCircle className="mr-2 h-3.5 w-3.5" />
          Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-[12px] text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader() {
  const { activeContext, isPlatformAdmin, tenantMemberships, availableContexts } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const hasMultipleTenants = tenantMemberships.length > 1;
  const hasMultipleContexts = availableContexts.length > 1;

  const handleLogoClick = () => {
    navigate(`/app/${activeContext}`);
  };

  return (
    <header className="h-14 border-b border-[#E4E4E7] bg-white px-4 md:px-6 flex items-center justify-between">
      {/* Left: Wordmark */}
      <div className="flex items-center">
        <button
          onClick={handleLogoClick}
          className="text-[15px] font-semibold text-[#0A0A0A] tracking-[-0.01em] hover:text-[#3F3F46] transition-colors"
        >
          Tribes
        </button>
      </div>

      {/* Center: Empty (intentional) */}
      <div className="flex-1" />

      {/* Right: Status cluster → Controls → Admin → Account */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Desktop: Status cluster */}
        <StatusCluster />
        
        {/* Mobile: Compact stacked status */}
        <MobileStatusDisplay />
        
        {/* Desktop: Controls */}
        {!isMobile && (hasMultipleTenants || hasMultipleContexts) && (
          <>
            <div className="h-4 w-px bg-[#E4E4E7]" />
            <div className="flex items-center gap-2">
              {hasMultipleTenants && <TenantControl />}
              {hasMultipleContexts && <ModeControl />}
            </div>
          </>
        )}
        
        {/* Platform Admin link */}
        {isPlatformAdmin && !isMobile && (
          <>
            <div className="h-4 w-px bg-[#E4E4E7]" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="h-7 px-2 text-[11px] text-[#71717A] hover:text-[#0A0A0A]"
            >
              Admin
            </Button>
          </>
        )}

        {/* Divider before account */}
        <div className="h-4 w-px bg-[#E4E4E7]" />
        
        {/* Account menu */}
        <AccountMenu />
      </div>
    </header>
  );
}
