import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, LayoutGrid, Terminal, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * USER MENU DROPDOWN — APPLE-STYLE ACCOUNT MENU
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Clean, minimal dropdown with:
 * - Workspaces → /workspaces
 * - System Console → /console (platform admins only)
 * - Settings → /account/settings
 * - Sign Out
 * 
 * Styling: White background, vertical list, thin dividers, no icons in rows
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function UserMenuDropdown() {
  const navigate = useNavigate();
  const { signOut, isPlatformAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center h-9 w-9 rounded-full",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-muted/50 transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="User menu"
        >
          <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-[200px] rounded-xl p-0 overflow-hidden shadow-lg",
          "bg-background border border-border"
        )}
      >
        {/* Workspaces */}
        <DropdownMenuItem
          onClick={() => navigate("/workspaces")}
          className={cn(
            "h-11 px-4 text-[14px] font-normal text-foreground",
            "rounded-none cursor-pointer",
            "border-b border-border/50"
          )}
        >
          Workspaces
        </DropdownMenuItem>

        {/* System Console - Platform admins only */}
        {isPlatformAdmin && (
          <DropdownMenuItem
            onClick={() => navigate("/console")}
            className={cn(
              "h-11 px-4 text-[14px] font-normal text-foreground",
              "rounded-none cursor-pointer",
              "border-b border-border/50"
            )}
          >
            System Console
          </DropdownMenuItem>
        )}

        {/* Settings */}
        <DropdownMenuItem
          onClick={() => navigate("/account/settings")}
          className={cn(
            "h-11 px-4 text-[14px] font-normal text-foreground",
            "rounded-none cursor-pointer",
            "border-b border-border/50"
          )}
        >
          Settings
        </DropdownMenuItem>

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className={cn(
            "h-11 px-4 text-[14px] font-normal text-foreground",
            "rounded-none cursor-pointer"
          )}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
