import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import { AppSearchInput } from "@/components/app-ui/AppSearchInput";
import { GlobalSearchDialog } from "@/components/search/GlobalSearchDialog";
import { SidebarHeader, ContentHeader } from "@/components/app/AppShell";
import { WorkspaceSwitcher } from "@/components/app/WorkspaceSwitcher";

import { HeaderIconButton } from "@/components/app/HeaderIconButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * MODULE HEADER — UNIFIED STRIPE-LIKE HEADER (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Used across ALL modules: /console, /admin, /licensing, /help
 * 
 * Layout:
 * - Desktop with sidebar: 2-column grid (sidebar column + content column)
 * - Mobile: Full-width header with optional module nav + icons
 * 
 * HEADER ICONS (right side):
 * - Notifications (bell) → opens placeholder dropdown
 * - Settings (gear) → /account
 * 
 * MOBILE NAV: Optional mobileNav prop renders a collapsible navigation
 * dropdown in place of the hidden sidebar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ModuleHeaderProps {
  showSidebarLogo?: boolean;
  /** Optional mobile navigation component (replaces hidden sidebar) */
  mobileNav?: ReactNode;
}

export function ModuleHeader({ showSidebarLogo = true, mobileNav }: ModuleHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  // Mobile header
  if (isMobile) {
    return (
      <>
        <div className="w-full h-full flex items-center justify-between px-4">
          {/* Show mobile nav if provided, otherwise show workspace switcher */}
          <div className="flex items-center gap-3">
            <WorkspaceSwitcher />
            {mobileNav}
          </div>

          <div className="flex items-center gap-1 shrink-0">
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
            <HeaderIconButton
              icon={Settings}
              aria-label="Settings"
              onClick={() => navigate("/account")}
            />
          </div>
        </div>
      </>
    );
  }

  // Desktop with sidebar: 2-column header grid
  if (showSidebarLogo) {
    return (
      <>
        <SidebarHeader logo={<WorkspaceSwitcher />} />

        <ContentHeader>
          {/* Left: Search trigger */}
          <div className="flex items-center">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-[320px]"
            >
              <AppSearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search..."
                rightHint="⌘ K"
                size="sm"
                className="w-full pointer-events-none"
              />
            </button>
          </div>

          {/* Right: Header icons */}
          <div className="flex items-center gap-1">
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
            <HeaderIconButton
              icon={Settings}
              aria-label="Settings"
              onClick={() => navigate("/account")}
            />
          </div>
        </ContentHeader>

        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }

  // Desktop without sidebar
  return (
    <>
      <div className="w-full h-full flex items-center justify-between px-6">
        <WorkspaceSwitcher />

        <div className="flex-1 flex items-center ml-6 max-w-md">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full max-w-[320px]"
          >
            <AppSearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search..."
              rightHint="⌘ K"
              size="sm"
              className="w-full pointer-events-none"
            />
          </button>
        </div>

        <div className="flex items-center gap-1">
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
          <HeaderIconButton
            icon={Settings}
            aria-label="Settings"
            onClick={() => navigate("/account")}
          />
        </div>
      </div>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
