import { useState } from "react";
import { Outlet, useNavigate, useLocation, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppSearchInput } from "@/components/app-ui";
import { useAuth } from "@/contexts/AuthContext";
import { WorkspaceSwitcher } from "@/components/app/WorkspaceSwitcher";
import { UserAvatar, getInitialsFromProfile } from "@/components/ui/user-avatar";
import { GlobalSearchDialog } from "@/components/search/GlobalSearchDialog";
import { 
  Menu,
  X,
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Tag,
  MessageSquare,
  BarChart3,
  Settings2,
  type LucideIcon
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * HELP WORKSTATION LAYOUT — STRIPE-LIKE SHELL WITH SIDEBAR + GLOBAL SEARCH
 * 
 * Matches the unified AppShell pattern:
 * - Left sidebar with WorkspaceSwitcher + navigation
 * - Top bar with global search + profile avatar
 * - Mercury-inspired light theme
 */

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  section?: 'main' | 'analytics' | 'settings';
}

const NAV_ITEMS: NavItem[] = [
  { path: "/help", label: "Overview", icon: LayoutDashboard, exact: true, section: 'main' },
  { path: "/help/audiences", label: "Audiences", icon: Users, section: 'main' },
  { path: "/help/categories", label: "Categories", icon: FolderOpen, section: 'main' },
  { path: "/help/articles", label: "Articles", icon: FileText, section: 'main' },
  { path: "/help/tags", label: "Tags", icon: Tag, section: 'main' },
  { path: "/help/messages", label: "Messages", icon: MessageSquare, section: 'main' },
  { path: "/help/analytics", label: "Analytics", icon: BarChart3, section: 'analytics' },
  { path: "/help/settings", label: "Settings", icon: Settings2, section: 'settings' },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  const mainItems = NAV_ITEMS.filter(item => item.section === 'main');
  const analyticsItems = NAV_ITEMS.filter(item => item.section === 'analytics');
  const settingsItems = NAV_ITEMS.filter(item => item.section === 'settings');

  const renderNavItem = (item: NavItem) => {
    const isActive = item.exact 
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);
    
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        className={cn(
          // Tighter spacing: reduced padding, smaller gap
          "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium",
          "transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
        )}
        style={{
          backgroundColor: isActive ? 'var(--tribes-nav-active)' : 'transparent',
          color: isActive ? 'var(--tribes-text)' : 'var(--tribes-text-muted)',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'var(--tribes-nav-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <Icon 
          className="h-4 w-4 shrink-0" 
          strokeWidth={1.5}
        />
        {item.label}
      </NavLink>
    );
  };

  return (
    <nav className="flex flex-col py-2 px-2">
      {/* Workspace Switcher - uses shared component */}
      <div className="mb-3">
        <WorkspaceSwitcher />
      </div>

      {/* Main Navigation — tighter vertical rhythm */}
      <div className="space-y-px">
        {mainItems.map(renderNavItem)}
      </div>

      {/* Analytics Section */}
      <div 
        className="mt-4 pt-3"
        style={{ borderTop: '1px solid var(--tribes-border-subtle)' }}
      >
        <div className="space-y-px">
          {analyticsItems.map(renderNavItem)}
        </div>
      </div>

      {/* Settings Section */}
      <div 
        className="mt-4 pt-3"
        style={{ borderTop: '1px solid var(--tribes-border-subtle)' }}
      >
        <div className="space-y-px">
          {settingsItems.map(renderNavItem)}
        </div>
      </div>
    </nav>
  );
}

function HeaderSearch({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [searchValue, setSearchValue] = useState("");
  
  return (
    <div className="w-full max-w-[680px]">
      <button onClick={onOpenSearch} className="w-full">
        <AppSearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search for anything"
          rightHint="⌘ K"
          size="md"
          className="pointer-events-none"
        />
      </button>
    </div>
  );
}

export function HelpWorkstationLayout() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const initials = getInitialsFromProfile(profile);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--tribes-shell-bg)' }}
    >
      {/* Header — Mercury-like */}
      <header 
        className={cn(
          "h-14 shrink-0 sticky top-0 z-40",
          isMobile ? "px-4" : "px-6"
        )}
        style={{ 
          backgroundColor: 'var(--tribes-header-bg)',
          borderBottom: '1px solid var(--tribes-border-subtle)',
        }}
      >
        {isMobile ? (
          /* Mobile Header */
          <div className="h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className={cn(
                  "flex items-center justify-center rounded-lg h-9 w-9",
                  "transition-colors duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                )}
                style={{ 
                  color: 'var(--tribes-text-muted)',
                  // @ts-ignore
                  '--tw-ring-color': 'var(--tribes-focus-ring-neutral)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--tribes-nav-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="Toggle navigation"
              >
                {mobileNavOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
              </button>
              
              <span
                className="font-semibold uppercase tracking-wider text-[11px]"
                style={{ color: 'var(--tribes-text)' }}
              >
                Tribes
              </span>
            </div>

            {/* Right: Avatar */}
            <button
              onClick={() => navigate("/account")}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded-full"
              aria-label="Account"
            >
              <UserAvatar initials={initials} size="md" variant="light" />
            </button>
          </div>
        ) : (
          /* Desktop Header — 3-column grid */
          <div 
            className="h-full grid items-center gap-4"
            style={{ gridTemplateColumns: '1fr minmax(420px, 680px) 1fr' }}
          >
            {/* Left: WorkspaceSwitcher */}
            <div className="flex items-center">
              <WorkspaceSwitcher />
            </div>

            {/* Center: Search */}
            <div className="flex justify-center">
              <HeaderSearch onOpenSearch={() => setSearchOpen(true)} />
            </div>

            {/* Right: Avatar */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => navigate("/account")}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded-full"
                aria-label="Account"
              >
                <UserAvatar initials={initials} size="sm" variant="light" />
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar — Stripe-like tighter width */}
        {!isMobile && (
          <aside 
            className="w-[220px] shrink-0 overflow-y-auto"
            style={{
              backgroundColor: 'var(--sidebar-bg)',
              borderRight: '1px solid var(--tribes-border-subtle)',
            }}
          >
            <SidebarNav />
          </aside>
        )}

        {/* Mobile Nav Overlay */}
        {isMobile && mobileNavOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside 
              className="fixed left-0 top-14 bottom-0 w-[280px] z-40 overflow-y-auto"
              style={{
                backgroundColor: 'var(--tribes-sidebar-bg-mercury)',
                borderRight: '1px solid var(--tribes-border-subtle)',
              }}
            >
              <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content area — transparent to show shell bg */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global search dialog */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
