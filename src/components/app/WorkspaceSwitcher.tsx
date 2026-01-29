import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  Settings, 
  LogOut,
  LayoutDashboard,
  HelpCircle,
  FileText,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WORKSPACE SWITCHER — STRIPE-STYLE TOP-LEFT DROPDOWN (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Displays:
 * - "Tribes" (bold) + active workspace name underneath
 * - Dropdown with: Settings, Available Modules, Sign out
 * 
 * ICON SIZES (HARD RULES):
 * - Dropdown menu icons: 16px (h-4 w-4)
 * - Chevron: 16px (h-4 w-4)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { profile, activeTenant, tenantMemberships, signOut } = useAuth();
  const {
    canAccessSystemConsole,
    canAccessHelpWorkstation,
    canAccessTribesLicensing,
    canAccessTribesAdmin,
  } = useModuleAccess();

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  // Determine the workspace name to display
  // Priority: activeTenant > first available membership > "No workspace"
  const getWorkspaceName = (): string => {
    if (activeTenant?.tenant_name) {
      return activeTenant.tenant_name;
    }
    // Fallback to first available membership if activeTenant is null but memberships exist
    if (tenantMemberships.length > 0 && tenantMemberships[0].tenant_name) {
      return tenantMemberships[0].tenant_name;
    }
    return "No workspace";
  };

  const workspaceName = getWorkspaceName();
  const hasNoWorkspace = workspaceName === "No workspace";

  // Build list of accessible modules - same source of truth as /workspaces
  const accessibleModules = [
    {
      label: "System Console",
      href: "/console",
      icon: Shield,
      hasAccess: canAccessSystemConsole,
    },
    {
      label: "Help Workstation",
      href: "/help",
      icon: HelpCircle,
      hasAccess: canAccessHelpWorkstation,
    },
    {
      label: "Tribes Licensing",
      href: "/licensing",
      icon: FileText,
      hasAccess: canAccessTribesLicensing,
    },
    {
      label: "Tribes Admin",
      href: "/admin",
      icon: LayoutDashboard,
      hasAccess: canAccessTribesAdmin,
    },
  ].filter(m => m.hasAccess);

  // Handle click when no workspace - route to /workspaces
  const handleTriggerClick = () => {
    if (hasNoWorkspace) {
      navigate("/workspaces");
    }
  };

  // Get initial for badge
  const getInitial = (): string => {
    if (activeTenant?.tenant_name) {
      return activeTenant.tenant_name.charAt(0).toUpperCase();
    }
    return "T";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={hasNoWorkspace ? handleTriggerClick : undefined}
          className={cn(
            // Stripe-like compact pill trigger
            "flex items-center gap-3 h-10 px-3 py-2 rounded-lg",
            "transition-colors duration-150",
            "hover:bg-muted/40",
            // Stripe-grade focus: no blue, subtle neutral ring only
            "focus:outline-none focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-muted-foreground/20 focus-visible:ring-offset-0"
          )}
        >
          {/* Left: Small badge with initial */}
          <div 
            className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <span className="text-[11px] font-semibold text-muted-foreground">
              {getInitial()}
            </span>
          </div>

          {/* Middle: Text stack (Tribes + Workspace name) */}
          <div className="flex flex-col items-start min-w-0">
            <span 
              className="text-[13px] font-semibold leading-tight truncate"
              style={{ color: 'var(--foreground)' }}
            >
              Tribes
            </span>
            <span 
              className={cn(
                "text-[12px] font-normal leading-tight truncate",
                hasNoWorkspace ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {workspaceName}
            </span>
          </div>

          {/* Right: Chevron inside trigger - 16px, tight */}
          <ChevronDown 
            className="h-4 w-4 shrink-0 text-muted-foreground/60" 
            strokeWidth={1.5} 
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-80 rounded-xl p-0 overflow-hidden"
      >
        {/* A) TOP IDENTITY BLOCK - Stripe pattern */}
        <div className="flex flex-col items-center py-5 px-5">
          {/* Larger centered badge */}
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-lg mb-3"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <span className="text-base font-semibold text-muted-foreground">
              {getInitial()}
            </span>
          </div>
          <span className="text-[14px] font-semibold text-foreground">
            Tribes
          </span>
          <span className={cn(
            "text-[13px] mt-0.5",
            hasNoWorkspace ? "text-destructive" : "text-muted-foreground"
          )}>
            {workspaceName}
          </span>
        </div>

        <Separator />

        {/* B) PRIMARY ACTIONS */}
        <div className="py-1">
          <DropdownMenuItem
            onClick={() => navigate("/account")}
            className="h-11 px-5 text-[13px] gap-3 rounded-none"
          >
            <Settings className="h-4 w-4 opacity-60" strokeWidth={1.5} />
            Settings
          </DropdownMenuItem>
        </div>

        {/* C) MODULES LIST */}
        {accessibleModules.length > 0 && (
          <>
            <Separator />
            <div className="py-2">
              <div className="px-5 py-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Modules
                </span>
              </div>
              {accessibleModules.map((module) => (
                <DropdownMenuItem
                  key={module.href}
                  onClick={() => navigate(module.href)}
                  className="h-11 px-5 text-[13px] gap-3 rounded-none"
                >
                  <module.icon className="h-4 w-4 opacity-60" strokeWidth={1.5} />
                  {module.label}
                </DropdownMenuItem>
              ))}
            </div>
          </>
        )}

        {/* D) FOOTER ACTIONS */}
        <Separator />
        <div className="py-1">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="h-11 px-5 text-[13px] gap-3 rounded-none text-foreground hover:text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4 opacity-60" strokeWidth={1.5} />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
