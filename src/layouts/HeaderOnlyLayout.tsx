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
 * HEADER-ONLY LAYOUT - NO SIDEBAR (WORKSPACES PAGE)
 * 
 * Uses centralized layout constants and TribesLogo component.
 */

interface HeaderOnlyLayoutProps {
  children: ReactNode;
}

export function HeaderOnlyLayout({ children }: HeaderOnlyLayoutProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <div 
      className="min-h-screen flex flex-col w-full"
      style={{ backgroundColor: CSS_VARS.APP_BG }}
    >
      {/* Header */}
      <header 
        className="shrink-0 sticky top-0 z-40 flex items-center justify-between"
        style={{ 
          height: LAYOUT.HEADER_HEIGHT,
          backgroundColor: CSS_VARS.TOPBAR_BG,
          borderBottom: `1px solid ${CSS_VARS.BORDER_SUBTLE}`,
          paddingLeft: LAYOUT.SIDEBAR_PADDING_X,
          paddingRight: LAYOUT.SIDEBAR_PADDING_X,
        }}
      >
        {/* Left: Logo */}
        <TribesLogo />

        {/* Right: Icons */}
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
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
