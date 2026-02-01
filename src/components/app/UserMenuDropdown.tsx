import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { AppDropdown, type AppDropdownItem } from "@/components/app-ui";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/**
 * USER MENU DROPDOWN — APPLE-STYLE ACCOUNT MENU
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Clean, minimal dropdown with:
 * - Workspaces → /workspaces
 * - System Console → /console (platform admins only)
 * - Settings → /account/settings
 * - Help → /help (mobile only)
 * - Sign Out
 * 
 * Uses AppDropdown from the app-ui design system for consistency.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function UserMenuDropdown() {
  const navigate = useNavigate();
  const { signOut, isPlatformAdmin } = useAuth();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  const menuItems: AppDropdownItem[] = [
    {
      label: "Workspaces",
      onClick: () => navigate("/workspaces"),
    },
    {
      label: "System Console",
      onClick: () => navigate("/console"),
      hidden: !isPlatformAdmin,
    },
    {
      label: "Settings",
      onClick: () => navigate("/account"),
    },
    {
      label: "Help",
      onClick: () => navigate("/help"),
      hidden: !isMobile,
    },
    {
      label: "Sign Out",
      onClick: handleSignOut,
    },
  ];

  const trigger = (
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
  );

  return (
    <AppDropdown
      trigger={trigger}
      items={menuItems}
      align="end"
      minWidth={200}
    />
  );
}
