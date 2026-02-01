import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, CircleHelp } from "lucide-react";
import { HeaderIconButton } from "@/components/app/HeaderIconButton";
import { UserMenuDropdown } from "@/components/app/UserMenuDropdown";
import { GlobalSearchDialog } from "@/components/search/GlobalSearchDialog";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * HEADER-ONLY LAYOUT — NO SIDEBAR (WORKSPACES PAGE)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Used for the Modules Home page (/workspaces) where no sidebar is needed.
 * Uses the same header pattern as ModuleHeader for consistency.
 * 
 * Header Layout (matching workstation headers):
 * - Left: Tribes wordmark logo (~80-100px)
 * - Right: Search icon, Notifications icon, User menu icon
 * 
 * No secondary row - goes straight to page content.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HEADER_HEIGHT = "56px";

// Tribes wordmark logo URL
const TRIBES_LOGO_URL = "https://rsdjfnsbimcdrxlhognv.supabase.co/storage/v1/object/public/Tribes%20Brand%20Files/Tribes%20-%20Wordmark%20Black%20Transparent.png";

interface HeaderOnlyLayoutProps {
  children: ReactNode;
}

export function HeaderOnlyLayout({ children }: HeaderOnlyLayoutProps) {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const handleLogoClick = () => {
    navigate("/workspaces");
  };

  return (
    <div 
      className="min-h-screen flex flex-col w-full"
      style={{ backgroundColor: 'var(--app-bg)' }}
    >
      {/* Header — 56px, full width */}
      <header 
        className="shrink-0 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6"
        style={{ 
          height: HEADER_HEIGHT,
          backgroundColor: 'var(--topbar-bg)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Left: Tribes wordmark logo */}
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

        {/* Right: Search, Notifications, Help, User menu */}
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

          <HeaderIconButton
            icon={CircleHelp}
            aria-label="Help & Resources"
            onClick={() => navigate("/help")}
          />
          
          <UserMenuDropdown />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Global search dialog */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
