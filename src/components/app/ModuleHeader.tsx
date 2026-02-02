import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, CircleHelp } from "lucide-react";
import { GlobalSearchDialog } from "@/components/search/GlobalSearchDialog";
import { SidebarHeader, ContentHeader } from "@/components/app/AppShell";
import { UserMenuDropdown } from "@/components/app/UserMenuDropdown";
import { HeaderIconButton } from "@/components/app/HeaderIconButton";
import { HelpBottomSheet } from "@/components/app/HelpBottomSheet";
import { TribesLogo } from "@/components/brand/TribesLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * MODULE HEADER - UNIFIED HEADER FOR ALL WORKSTATIONS
 * 
 * Uses TribesLogo component for consistent branding.
 * Layout dimensions from @/config/layout.ts
 */

interface ModuleHeaderProps {
  showSidebarLogo?: boolean;
}

export function ModuleHeader({ showSidebarLogo = true }: ModuleHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

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

  // Mobile header
  if (isMobile) {
    return (
      <>
        <div className="w-full h-full flex items-center justify-between px-4">
          <TribesLogo />
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
        <SidebarHeader logo={<TribesLogo />} />
        <ContentHeader>
          <div />
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
        <TribesLogo />
        {rightIcons}
      </div>
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
