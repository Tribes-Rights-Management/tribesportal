import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar, getInitialsFromProfile } from "@/components/ui/user-avatar";
import { LogOut, Settings, Moon, Sun, Shield, ArrowLeft } from "lucide-react";
import { NAV_LABELS } from "@/styles/tokens";

/**
 * SHARED PROFILE DROPDOWN — STRIPE-LEVEL DENSITY
 * 
 * Centralized profile dropdown with consistent styling across all headers.
 * 
 * Specs:
 * - Menu width: ~260px
 * - Icon size: 16px (h-4 w-4), left-aligned
 * - Text: text-[13px]
 * - Padding: container py-2, items px-3 py-2, gap-2
 * - Sign out: neutral by default, red on hover
 */

// Menu icon size constant
const MENU_ICON_SIZE = 16;
const MENU_ICON_STROKE = 1.5;

interface ProfileDropdownProps {
  /** Show "Return to System Console" option */
  showReturnToConsole?: boolean;
  /** Show "System Console" option (when already in console) */
  showSystemConsole?: boolean;
  /** Avatar variant */
  avatarVariant?: "default" | "dark" | "light";
  /** Context label shown below user name */
  contextLabel?: string;
}

export function ProfileDropdown({
  showReturnToConsole = false,
  showSystemConsole = false,
  avatarVariant = "default",
  contextLabel,
}: ProfileDropdownProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
  };

  const initials = getInitialsFromProfile(profile);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserAvatar
          initials={initials}
          size={isMobile ? "md" : "sm"}
          variant={avatarVariant}
          aria-label="Account menu"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 rounded-lg"
        sideOffset={8}
      >
        {/* User info header */}
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium truncate">
            {profile?.full_name || profile?.email}
          </p>
          {profile?.email && profile?.full_name && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {profile.email}
            </p>
          )}
          {contextLabel && (
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              {contextLabel}
            </p>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Return to System Console */}
        {showReturnToConsole && (
          <>
            <DropdownMenuItem
              onClick={() => navigate("/admin")}
              className="px-3 py-2 text-[13px] gap-2"
            >
              <ArrowLeft className="h-4 w-4 opacity-50" strokeWidth={1.5} />
              Return to System Console
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* System Console (when already in console) */}
        {showSystemConsole && (
          <DropdownMenuItem
            onClick={() => navigate("/admin")}
            className="px-3 py-2 text-[13px] gap-2"
          >
            <Shield className="h-4 w-4 opacity-50" strokeWidth={1.5} />
            {NAV_LABELS.SYSTEM_CONSOLE}
          </DropdownMenuItem>
        )}

        {/* Account Settings */}
        <DropdownMenuItem
          onClick={() => navigate("/account")}
          className="px-3 py-2 text-[13px] gap-2"
        >
          <Settings className="h-4 w-4 opacity-50" strokeWidth={1.5} />
          {NAV_LABELS.ACCOUNT_SETTINGS}
        </DropdownMenuItem>

        {/* Theme Toggle */}
        <DropdownMenuItem
          onClick={toggleTheme}
          className="px-3 py-2 text-[13px] gap-2"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 opacity-50" strokeWidth={1.5} />
          ) : (
            <Moon className="h-4 w-4 opacity-50" strokeWidth={1.5} />
          )}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign out - neutral by default, red on hover */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="px-3 py-2 text-[13px] gap-2 text-foreground hover:text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 opacity-50" strokeWidth={1.5} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
