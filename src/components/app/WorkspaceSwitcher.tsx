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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={hasNoWorkspace ? handleTriggerClick : undefined}
          className={cn(
            // Stripe-like compact pill trigger - no badge, just text + chevron
            "flex items-center gap-2 h-10 px-3 py-2 rounded-lg",
            "transition-colors duration-150",
            "hover:bg-muted/40",
            // No ring/outline/border in ANY state (idle, hover, focus, active)
            "outline-none focus:outline-none focus-visible:outline-none",
            "ring-0 focus:ring-0 focus-visible:ring-0",
            "border-0"
          )}
        >
          {/* Text stack (Tribes + Workspace name) - no badge */}
          <div className="flex flex-col items-start min-w-0">
            <span className="text-[13px] font-semibold leading-tight text-foreground">
              Tribes
            </span>
            <span 
              className={cn(
                "text-[12px] leading-tight truncate max-w-[160px]",
                hasNoWorkspace ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {workspaceName}
            </span>
          </div>

          {/* Chevron inside trigger - 16px, tight, vertically centered */}
          <ChevronDown 
            className="h-4 w-4 shrink-0 text-muted-foreground/50 ml-0.5" 
            strokeWidth={1.5} 
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-[280px] rounded-xl p-0 overflow-hidden shadow-lg"
      >
        {/* A) TOP IDENTITY BLOCK - text only, no badge */}
        <div className="flex flex-col items-center py-4 px-4">
          <span className="text-[14px] font-semibold text-foreground">
            Tribes
          </span>
          <span className={cn(
            "text-[12px] mt-0.5",
            hasNoWorkspace ? "text-destructive" : "text-muted-foreground"
          )}>
            {workspaceName}
          </span>
        </div>

        <Separator className="my-0" />

        {/* B) PRIMARY ACTIONS - tighter rows */}
        <div className="py-1">
          <DropdownMenuItem
            onClick={() => navigate("/account")}
            className="h-10 px-4 text-[13px] gap-2.5 rounded-none cursor-pointer"
          >
            <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            Settings
          </DropdownMenuItem>
        </div>

        {/* C) MODULES LIST - tight density */}
        {accessibleModules.length > 0 && (
          <>
            <Separator className="my-0" />
            <div className="py-1">
              <div className="px-4 py-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                  Modules
                </span>
              </div>
              {accessibleModules.map((module) => (
                <DropdownMenuItem
                  key={module.href}
                  onClick={() => navigate(module.href)}
                  className="h-10 px-4 text-[13px] gap-2.5 rounded-none cursor-pointer"
                >
                  <module.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  {module.label}
                </DropdownMenuItem>
              ))}
            </div>
          </>
        )}

        {/* D) FOOTER ACTIONS */}
        <Separator className="my-0" />
        <div className="py-1">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="h-10 px-4 text-[13px] gap-2.5 rounded-none cursor-pointer text-foreground hover:text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
