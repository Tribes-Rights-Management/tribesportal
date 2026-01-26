import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, HelpCircle, Bell, Settings } from "lucide-react";
import { AppSearchInput } from "@/components/app-ui/AppSearchInput";
import { GlobalSearchDialog } from "@/components/search/GlobalSearchDialog";
import { SidebarHeader, ContentHeader } from "@/components/app/AppShell";
import { WorkspaceSwitcher } from "@/components/app/WorkspaceSwitcher";
import { HeaderIconButton } from "@/components/app/HeaderIconButton";
import { HelpDrawer } from "@/components/app/HelpDrawer";
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
 * This is the SINGLE header component used across ALL modules:
 * - /console, /admin, /licensing, /help
 * 
 * Layout:
 * - Desktop with sidebar: 2-column grid (sidebar column + content column)
 *   - Left column: WorkspaceSwitcher in sidebar-colored region
 *   - Right column: Search (left-aligned), header icons (right)
 * - Mobile: Full-width header with WorkspaceSwitcher + icons
 * 
 * HEADER ICONS (right side, replacing avatar):
 * - Workspaces (grid icon) → /workspaces
 * - Help (help circle) → opens HelpDrawer
 * - Notifications (bell) → opens placeholder dropdown
 * - Settings (gear) → /account (or fallback)
 * 
 * STRICT INVARIANTS:
 * - Header icons: 18px (inside HeaderIconButton)
 * - Dropdown icons: 16px
 * - Search: consistent Stripe-like pill
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ModuleHeaderProps {
  /** Whether we're in a sidebar layout (show split 2-column header) */
  showSidebarLogo?: boolean;
}

export function ModuleHeader({
  showSidebarLogo = true,
}: ModuleHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  // Mobile header - compact with WorkspaceSwitcher + icons
  if (isMobile) {
    return (
      <>
        <div className="w-full h-full flex items-center justify-between px-4">
          {/* Left: Workspace switcher (compact) */}
          <WorkspaceSwitcher />

          {/* Right: Header icons */}
          <div className="flex items-center gap-1 shrink-0">
            <HeaderIconButton
              icon={LayoutGrid}
              aria-label="Workspaces"
              onClick={() => navigate("/workspaces")}
            />
            <HeaderIconButton
              icon={HelpCircle}
              aria-label="Help"
              onClick={() => setHelpOpen(true)}
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
            <HeaderIconButton
              icon={Settings}
              aria-label="Settings"
              onClick={() => navigate("/account")}
            />
          </div>
        </div>
        
        {/* Help Drawer */}
        <HelpDrawer open={helpOpen} onOpenChange={setHelpOpen} />
      </>
    );
  }

  // Desktop with sidebar: 2-column header grid
  if (showSidebarLogo) {
    return (
      <>
        {/* Left column: Sidebar-colored workspace switcher area */}
        <SidebarHeader
          logo={<WorkspaceSwitcher />}
        />

        {/* Right column: Search + header icons */}
        <ContentHeader>
          {/* Left: Search trigger (left-aligned, not centered) */}
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

          {/* Right: Header icons (replacing avatar) */}
          <div className="flex items-center gap-1">
            <HeaderIconButton
              icon={LayoutGrid}
              aria-label="Workspaces"
              onClick={() => navigate("/workspaces")}
            />
            <HeaderIconButton
              icon={HelpCircle}
              aria-label="Help"
              onClick={() => setHelpOpen(true)}
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
            <HeaderIconButton
              icon={Settings}
              aria-label="Settings"
              onClick={() => navigate("/account")}
            />
          </div>
        </ContentHeader>

        {/* Global search dialog */}
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        
        {/* Help Drawer */}
        <HelpDrawer open={helpOpen} onOpenChange={setHelpOpen} />
      </>
    );
  }

  // Desktop without sidebar (uses WorkspaceSwitcher as well)
  return (
    <>
      <div className="w-full h-full flex items-center justify-between px-6">
        {/* Left: Workspace switcher */}
        <WorkspaceSwitcher />

        {/* Center/Left: Search trigger */}
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

        {/* Right: Header icons */}
        <div className="flex items-center gap-1">
          <HeaderIconButton
            icon={LayoutGrid}
            aria-label="Workspaces"
            onClick={() => navigate("/workspaces")}
          />
          <HeaderIconButton
            icon={HelpCircle}
            aria-label="Help"
            onClick={() => setHelpOpen(true)}
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
          <HeaderIconButton
            icon={Settings}
            aria-label="Settings"
            onClick={() => navigate("/account")}
          />
        </div>
      </div>

      {/* Global search dialog */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      
      {/* Help Drawer */}
      <HelpDrawer open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}