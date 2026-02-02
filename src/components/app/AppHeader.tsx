import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, CircleHelp } from "lucide-react";
import { HeaderIconButton } from "@/components/app/HeaderIconButton";
import { UserMenuDropdown } from "@/components/app/UserMenuDropdown";
import { HelpBottomSheet } from "@/components/app/HelpBottomSheet";
import { GlobalSearchDialog } from "@/components/search/GlobalSearchDialog";
import { TribesLogo } from "@/components/brand/TribesLogo";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { LAYOUT, CSS_VARS } from "@/config/layout";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * APP HEADER — SINGLE SOURCE OF TRUTH FOR ALL HEADERS
 * 
 * Used by:
 * - AppShell (module pages with sidebar)
 * - HeaderOnlyLayout (workspaces page without sidebar)
 * 
 * Ensures logo position is IDENTICAL everywhere.
 * 
 * Layout:
 * - Logo area: 200px width (matches sidebar), px-2 padding, logo has px-3 internal
 * - Content area: flex-1, right-aligned icons
 */

interface AppHeaderProps {
  /** Show the 2-column grid layout (for pages with sidebar) */
  showSidebarColumn?: boolean;
}

export function AppHeader({ showSidebarColumn = false }: AppHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  // Right side icons - shared across all layouts
  const rightIcons = (
    <div className="flex items-center gap-1">
      <HeaderIconButton
        icon={Search}
        aria-label="Search"
        onClick={() => setSearchOpen(true)}
      />

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

      {isMobile ? (
        <HelpBottomSheet />
      ) : (
        <HeaderIconButton
          icon={CircleHelp}
          aria-label="Help & Resources"
          onClick={() => navigate("/help")}
        />
      )}

      <UserMenuDropdown />
    </div>
  );

  // Logo area - LEFT ALIGNED to match nav items below
  // SideNav uses: px-2 container (8px) + px-3 on links (12px) = 20px to text
  // We use px-5 (20px) to align logo with nav item text
  const logoArea = (
    <div className="h-full flex items-center pl-5">
      <TribesLogo />
    </div>
  );

  // Two-column layout (for pages with sidebar)
  if (showSidebarColumn) {
    return (
      <>
        {/* Logo column - matches sidebar width */}
        <div 
          className="h-full flex items-center"
          style={{ backgroundColor: CSS_VARS.SIDEBAR_BG }}
        >
          {logoArea}
        </div>

        {/* Content column */}
        <div 
          className="h-full flex items-center justify-end px-6"
          style={{ backgroundColor: CSS_VARS.TOPBAR_BG }}
        >
          {rightIcons}
        </div>

        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }

  // Single row layout (for pages without sidebar)
  return (
    <>
      <div className="w-full h-full flex items-center justify-between">
        {logoArea}
        <div className="px-6">
          {rightIcons}
        </div>
      </div>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
