import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, CircleHelp } from "lucide-react";
import { GlobalSearchDialog } from "@/components/search/GlobalSearchDialog";
import { SidebarHeader, ContentHeader } from "@/components/app/AppShell";
import { UserMenuDropdown } from "@/components/app/UserMenuDropdown";
import { HeaderIconButton } from "@/components/app/HeaderIconButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * MODULE HEADER — SIMPLIFIED DESIGN (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Used across ALL workstations: /admin, /licensing, /help, /rights
 * 
 * Layout:
 * - Left: Tribes wordmark logo (image, ~80-100px wide)
 * - Right: Search icon, Notifications icon, User menu icon
 * 
 * Desktop with sidebar: 2-column grid (sidebar column + content column)
 * Mobile: Full-width header with logo + icons
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Tribes wordmark logo URL
const TRIBES_LOGO_URL = "https://rsdjfnsbimcdrxlhognv.supabase.co/storage/v1/object/public/Tribes%20Brand%20Files/Tribes%20-%20Wordmark%20Black%20Transparent.png";

interface ModuleHeaderProps {
  showSidebarLogo?: boolean;
}

export function ModuleHeader({ showSidebarLogo = true }: ModuleHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const handleLogoClick = () => {
    navigate("/workspaces");
  };

  // Tribes wordmark logo component
  const tribesLogo = (
    <button
      onClick={handleLogoClick}
      className="flex items-center h-9 px-1 rounded-lg hover:bg-muted/50 transition-colors"
      aria-label="Go to workspaces"
    >
      <img
        src={TRIBES_LOGO_URL}
        alt="Tribes"
        className="h-5 w-auto dark:invert"
        style={{ maxWidth: "90px" }}
      />
    </button>
  );

  // Right side icons (shared between mobile and desktop)
  const rightIcons = (
    <div className="flex items-center gap-1">
      {/* Search */}
      <HeaderIconButton
        icon={Search}
        aria-label="Search"
        onClick={() => setSearchOpen(true)}
      />

      {/* Notifications */}
      <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <PopoverTrigger asChild>
          <HeaderIconButton
            icon={Bell}
            aria-label="Notifications"
            badgeCount={unreadCount}
          />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-4">
          <p className="text-[13px] text-muted-foreground text-center py-6">
            No notifications yet
          </p>
        </PopoverContent>
      </Popover>

      {/* Help */}
      <HeaderIconButton
        icon={CircleHelp}
        aria-label="Help & Resources"
        onClick={() => navigate("/help")}
      />

      {/* User menu */}
      <UserMenuDropdown />
    </div>
  );

  // Mobile header
  if (isMobile) {
    return (
      <>
        <div className="w-full h-full flex items-center justify-between px-4">
          {/* Left: Logo only */}
          {tribesLogo}

          {/* Right: Icons */}
          {rightIcons}
        </div>

        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }

  // Desktop with sidebar: 2-column header grid
  if (showSidebarLogo) {
    return (
      <>
        <SidebarHeader logo={tribesLogo} />

        <ContentHeader>
          {/* Left: empty spacer */}
          <div />
          
          {/* Right: Header icons */}
          {rightIcons}
        </ContentHeader>

        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }

  // Desktop without sidebar (fallback)
  return (
    <>
      <div className="w-full h-full flex items-center justify-between px-6">
        {/* Left: Logo only */}
        {tribesLogo}

        {/* Right: Icons */}
        {rightIcons}
      </div>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
