import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  Settings, 
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { iconClass, iconStroke } from "@/components/ui/Icon";

/**
 * WORKSPACE SWITCHER — STRIPE-STYLE TOP-LEFT DROPDOWN (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * PURPOSE: Workspace/account context ONLY — NOT for module navigation.
 * 
 * Displays:
 * - "Tribes" (bold) + active workspace name underneath
 * - Dropdown with: Settings, Sign out
 * 
 * Module navigation is handled by ModuleLauncherPopover (top-right 4-squares).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { activeTenant, tenantMemberships, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  // Determine the workspace name to display
  const getWorkspaceName = (): string => {
    if (activeTenant?.tenant_name) {
      return activeTenant.tenant_name;
    }
    if (tenantMemberships.length > 0 && tenantMemberships[0].tenant_name) {
      return tenantMemberships[0].tenant_name;
    }
    return "No workspace";
  };

  const workspaceName = getWorkspaceName();
  const hasNoWorkspace = workspaceName === "No workspace";

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
            // Stripe-like compact pill trigger
            "flex items-center gap-2 h-10 px-3 py-2 rounded-lg",
            "transition-colors duration-150",
            "hover:bg-muted/40",
            // No ring/outline/border in ANY state
            "outline-none focus:outline-none focus-visible:outline-none",
            "ring-0 focus:ring-0 focus-visible:ring-0",
            "border-0"
          )}
        >
          {/* Text stack (Tribes + Workspace name) */}
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

          {/* Chevron */}
          <ChevronDown
            className={cn(iconClass("xs"), "block text-muted-foreground/50 ml-0.5")}
            strokeWidth={iconStroke("default")}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(
          "w-[240px] rounded-xl p-0 overflow-hidden shadow-lg",
          "[&_svg]:shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:[stroke-width:1.25]"
        )}
      >
        {/* TOP IDENTITY BLOCK */}
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

        {/* SETTINGS */}
        <div className="py-1">
          <DropdownMenuItem
            onClick={() => navigate("/account")}
            className="h-10 px-4 text-sm gap-3 rounded-none cursor-pointer"
          >
            <Settings
              className={cn(iconClass("xs"), "text-muted-foreground")}
              strokeWidth={iconStroke("default")}
            />
            Settings
          </DropdownMenuItem>
        </div>

        <Separator className="my-0" />

        {/* SIGN OUT */}
        <div className="py-1">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="h-10 px-4 text-sm gap-3 rounded-none cursor-pointer text-foreground hover:text-destructive focus:text-destructive"
          >
            <LogOut
              className={cn(iconClass("xs"), "text-muted-foreground")}
              strokeWidth={iconStroke("default")}
            />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
