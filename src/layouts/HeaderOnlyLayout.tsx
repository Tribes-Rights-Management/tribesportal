import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, Bell, Settings } from "lucide-react";
import { WorkspaceSwitcher } from "@/components/app/WorkspaceSwitcher";
import { HeaderIconButton } from "@/components/app/HeaderIconButton";
import { HelpDrawer } from "@/components/app/HelpDrawer";
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
 * Header: 56px height with WorkspaceSwitcher (left) + icon buttons (right)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HEADER_HEIGHT = "56px";

interface HeaderOnlyLayoutProps {
  children: ReactNode;
}

export function HeaderOnlyLayout({ children }: HeaderOnlyLayoutProps) {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <div 
      className="min-h-screen flex flex-col w-full"
      style={{ backgroundColor: 'var(--app-bg)' }}
    >
      {/* Header — 56px, full width */}
      <header 
        className="shrink-0 sticky top-0 z-40 flex items-center justify-between px-6"
        style={{ 
          height: HEADER_HEIGHT,
          backgroundColor: 'var(--topbar-bg)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Left: WorkspaceSwitcher */}
        <WorkspaceSwitcher />

        {/* Right: Header icons */}
        <div className="flex items-center gap-1">
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
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
      {/* Help Drawer */}
      <HelpDrawer open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
