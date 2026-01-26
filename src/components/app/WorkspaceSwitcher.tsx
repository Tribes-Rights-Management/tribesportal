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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={hasNoWorkspace ? handleTriggerClick : undefined}
          className={cn(
            "flex items-center gap-2 px-3 py-2 w-full rounded-md",
            "transition-colors duration-150",
            "hover:bg-muted/50",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
          )}
        >
          {/* Text stack: Tribes + Workspace name */}
          <div className="flex flex-col items-start flex-1 min-w-0">
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

          {/* Chevron - 16px */}
          <ChevronDown 
            className="h-4 w-4 shrink-0 opacity-50" 
            strokeWidth={1.5} 
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="w-56 rounded-lg"
      >
        {/* Settings Section */}
        <DropdownMenuItem
          onClick={() => navigate("/account")}
          className="px-3 py-2 text-[13px] gap-2"
        >
          <Settings className="h-4 w-4 opacity-60" strokeWidth={1.5} />
          Settings
        </DropdownMenuItem>

        {/* Modules Section */}
        {accessibleModules.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Modules
              </span>
            </div>
            {accessibleModules.map((module) => (
              <DropdownMenuItem
                key={module.href}
                onClick={() => navigate(module.href)}
                className="px-3 py-2 text-[13px] gap-2"
              >
                <module.icon className="h-4 w-4 opacity-60" strokeWidth={1.5} />
                {module.label}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Sign out */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="px-3 py-2 text-[13px] gap-2 text-foreground hover:text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 opacity-60" strokeWidth={1.5} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
