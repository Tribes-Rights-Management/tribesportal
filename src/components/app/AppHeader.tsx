import { useAuth } from "@/contexts/AuthContext";
import { TenantSelector } from "./TenantSelector";
import { ContextToggle } from "./ContextToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

function ModeIndicator() {
  const { activeContext } = useAuth();
  
  const contextLabel = activeContext === "licensing" ? "Licensing" : "Publishing";
  
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12px] text-[#A1A1AA] font-normal tracking-wide uppercase">
        Mode:
      </span>
      <span className="text-[12px] text-[#52525B] font-medium">
        {contextLabel}
      </span>
    </div>
  );
}

function TenantIndicator() {
  const { activeTenant } = useAuth();
  
  if (!activeTenant) return null;
  
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12px] text-[#A1A1AA] font-normal tracking-wide uppercase">
        Tenant:
      </span>
      <span className="text-[12px] text-[#52525B] font-medium truncate max-w-[200px]">
        {activeTenant.tenant_name}
      </span>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="hidden md:flex items-center gap-4 border-l border-[#E4E4E7] pl-4 ml-2">
      <TenantIndicator />
      <div className="h-3 w-px bg-[#E4E4E7]" />
      <ModeIndicator />
    </div>
  );
}

function MobileStatusMenu() {
  const { activeTenant, activeContext, availableContexts, setActiveContext } = useAuth();
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  const contextLabel = activeContext === "licensing" ? "Licensing" : "Publishing";
  const hasBothContexts = availableContexts.length > 1;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden h-8 px-2 gap-1 text-[12px] text-[#52525B] hover:text-[#0A0A0A]"
        >
          <span className="font-medium">{contextLabel}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Tenant Status */}
        <div className="px-3 py-2 border-b border-[#E4E4E7]">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#A1A1AA] font-normal tracking-wide uppercase">
              Tenant:
            </span>
            <span className="text-[12px] text-[#52525B] font-medium truncate">
              {activeTenant?.tenant_name ?? "None"}
            </span>
          </div>
        </div>
        
        {/* Mode Status */}
        <div className="px-3 py-2 border-b border-[#E4E4E7]">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#A1A1AA] font-normal tracking-wide uppercase">
              Mode:
            </span>
            <span className="text-[12px] text-[#52525B] font-medium">
              {contextLabel}
            </span>
          </div>
        </div>
        
        {/* Context Switch Options (only if both contexts available) */}
        {hasBothContexts && (
          <>
            <div className="px-3 py-1.5">
              <span className="text-[10px] text-[#A1A1AA] font-medium tracking-wide uppercase">
                Switch Mode
              </span>
            </div>
            {availableContexts.map((context) => (
              <DropdownMenuItem
                key={context}
                onClick={() => setActiveContext(context)}
                className={`text-[13px] ${activeContext === context ? "bg-[#F4F4F5]" : ""}`}
              >
                {context === "licensing" ? "Licensing" : "Publishing"}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader() {
  const { profile, signOut, isPlatformAdmin, activeContext, availableContexts } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
  };

  const showContextToggle = availableContexts.length > 1;

  return (
    <header className="h-14 border-b border-[#E4E4E7] bg-white px-4 md:px-6 flex items-center justify-between">
      {/* Left: Logo + Tenant Selector */}
      <div className="flex items-center gap-4 md:gap-6">
        <span className="text-[15px] font-semibold text-[#0A0A0A] tracking-[-0.01em]">
          Tribes
        </span>
        <div className="hidden md:block h-5 w-px bg-[#E4E4E7]" />
        <div className="hidden md:block">
          <TenantSelector />
        </div>
        
        {/* Desktop Status Bar */}
        <StatusBar />
      </div>

      {/* Right: Context Toggle + Account */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Status Menu */}
        <MobileStatusMenu />
        
        {/* Desktop Context Toggle (only if both contexts available) */}
        {!isMobile && showContextToggle && <ContextToggle />}
        
        {isPlatformAdmin && (
          <>
            <div className="hidden md:block h-5 w-px bg-[#E4E4E7]" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="hidden md:flex text-[13px] text-[#71717A] hover:text-[#0A0A0A]"
            >
              Admin
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full bg-[#F4F4F5] hover:bg-[#E4E4E7]"
            >
              <User className="h-4 w-4 text-[#71717A]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-[13px] font-medium text-[#0A0A0A]">
                {profile?.email}
              </p>
              <p className="text-[12px] text-[#71717A] capitalize">
                {activeContext} Portal
              </p>
            </div>
            <DropdownMenuSeparator />
            
            {/* Mobile-only: Tenant selector in account menu */}
            {isMobile && (
              <>
                <div className="px-2 py-1.5">
                  <TenantSelector />
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem
              onClick={() => navigate(`/app/${activeContext}/settings`)}
              className="text-[13px]"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-[13px] text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
