import { useNavigate, useLocation } from "react-router-dom";
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
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { iconClass, iconStroke } from "@/components/ui/Icon";

/**
 * WORKSPACE SWITCHER — STRIPE-STYLE TOP-LEFT DROPDOWN (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * PURPOSE: Workspace/account context + module switching entry point.
 * 
 * Displays:
 * - "Tribes" (bold) + current area name underneath (red)
 * - Dropdown with: Workspaces, Settings, Sign out
 * 
 * The ONLY module switching entry point in the app header.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * SINGLE SOURCE OF TRUTH: Route → Current Area Label
 * Used by header trigger subline and dropdown identity block
 */
function useCurrentAreaLabel(): string {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === "/workspaces" || pathname === "/") {
    return "Workspaces";
  }
  if (pathname.startsWith("/console")) {
    return "System Console";
  }
  if (pathname.startsWith("/help")) {
    return "Help";
  }
  if (pathname.startsWith("/licensing")) {
    return "Licensing";
  }
  if (pathname.startsWith("/admin")) {
    return "Admin";
  }
  if (pathname.startsWith("/account")) {
    return "Account Settings";
  }
  
  // Default fallback
  return "Workspaces";
}

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const currentAreaLabel = useCurrentAreaLabel();

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
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
          {/* Text stack (Tribes + Current Area) */}
          <div className="flex flex-col items-start min-w-0">
            <span className="text-[13px] font-semibold leading-tight text-foreground">
              Tribes
            </span>
            <span className="text-[12px] leading-tight truncate max-w-[160px] text-destructive">
              {currentAreaLabel}
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
          <span className="text-[12px] mt-0.5 text-destructive">
            {currentAreaLabel}
          </span>
        </div>

        <Separator className="my-0" />

        {/* WORKSPACES */}
        <div className="py-1">
          <DropdownMenuItem
            onClick={() => navigate("/workspaces")}
            className="h-10 px-4 text-sm gap-3 rounded-none cursor-pointer"
          >
            <LayoutGrid
              className={cn(iconClass("xs"), "text-muted-foreground")}
              strokeWidth={iconStroke("default")}
            />
            Workspaces
          </DropdownMenuItem>
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
