import { useState } from "react";
import { Bell, Search } from "lucide-react";
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
  /** Render only the sidebar logo area (used inside fixed sidebar) */
  sidebarOnly?: boolean;
  /** Render only the content-area icons (used when logo is in fixed sidebar) */
  contentOnly?: boolean;
}

export function AppHeader({ showSidebarColumn = false, sidebarOnly = false, contentOnly = false }: AppHeaderProps) {
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

      {/* Help - use bottom sheet/drawer for mobile, popover for desktop */}
      <HelpBottomSheet />

      <UserMenuDropdown />
    </div>
  );

  // Logo area - LEFT ALIGNED to match nav items below
  // Desktop: SideNav uses px-2 container (8px) + px-3 on links (12px) = 20px to text
  // Mobile: Logo at left edge, 20px padding applied at container level (no extra offset)
  const logoArea = (
    <div className="h-full flex items-center" style={{ paddingLeft: isMobile ? 0 : 20 }}>
      <TribesLogo />
    </div>
  );

  // Sidebar-only mode: just render the logo for the fixed sidebar
  if (sidebarOnly) {
    return <>{logoArea}</>;
  }

  // Content-only mode: just render the right icons (logo is in fixed sidebar)
  if (contentOnly) {
    return (
      <>
        {rightIcons}
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }

  // Two-column layout (legacy — kept for compatibility)
  if (showSidebarColumn) {
    return (
      <>
        <div 
          className="h-full flex items-center"
          style={{ backgroundColor: CSS_VARS.SIDEBAR_BG }}
        >
          {logoArea}
        </div>
        <div 
          className="h-full flex items-center justify-end"
          style={{ backgroundColor: CSS_VARS.TOPBAR_BG, paddingRight: 24 }}
        >
          {rightIcons}
        </div>
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }

  // Single row layout (for pages without sidebar)
  // Use same 200px logo column width as sidebar pages for consistent logo position
  return (
    <>
      <div className="w-full h-full flex items-center justify-between">
        <div 
          className="h-full flex items-center shrink-0"
          style={{ width: '200px', paddingLeft: '20px' }}
        >
          <TribesLogo />
        </div>
        <div style={{ paddingRight: '20px' }}>
          {rightIcons}
        </div>
      </div>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
