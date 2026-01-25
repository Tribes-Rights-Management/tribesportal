import { useState } from "react";
import { Outlet, useNavigate, useLocation, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppSearchInput } from "@/components/app-ui";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  Settings, 
  ArrowLeft, 
  Menu,
  X,
  Search,
  ChevronDown,
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
import { NAV_LABELS, PORTAL_TYPOGRAPHY, PORTAL_AVATAR } from "@/styles/tokens";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * HELP WORKSTATION LAYOUT — Mercury-like Design
 * 
 * Light shell background, white header, soft-gray sidebar.
 * No blue accents - neutral focus rings and hover states.
 * 
 * Design principles:
 * - Shell bg: #F6F7F9 (Mercury canvas)
 * - Header: White with subtle bottom border
 * - Sidebar: Soft gray (#F4F5F7) with pill active items
 * - Icons: 18px with 1.5 stroke width
 * - Focus: Neutral ring (no blue)
 */

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  section?: 'main' | 'analytics' | 'settings';
}

const NAV_ITEMS: NavItem[] = [
  { path: "/help-workstation", label: "Overview", icon: LayoutDashboard, exact: true, section: 'main' },
  { path: "/help-workstation/audiences", label: "Audiences", icon: Users, section: 'main' },
  { path: "/help-workstation/categories", label: "Categories", icon: FolderOpen, section: 'main' },
  { path: "/help-workstation/articles", label: "Articles", icon: FileText, section: 'main' },
  { path: "/help-workstation/tags", label: "Tags", icon: Tag, section: 'main' },
  { path: "/help-workstation/messages", label: "Messages", icon: MessageSquare, section: 'main' },
  { path: "/help-workstation/analytics", label: "Analytics", icon: BarChart3, section: 'analytics' },
  { path: "/help-workstation/settings", label: "Settings", icon: Settings2, section: 'settings' },
];

function HelpAccountMenu() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const isMobileView = useIsMobile();
  const avatarSize = isMobileView ? 32 : PORTAL_AVATAR.sizeDesktop;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "rounded-full shrink-0 inline-flex items-center justify-center",
            "text-[10px] font-medium uppercase",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "transition-colors duration-150"
          )}
          style={{
            height: avatarSize,
            width: avatarSize,
            minHeight: avatarSize,
            minWidth: avatarSize,
            backgroundColor: '#E5E7EB',
            color: '#374151',
            // Neutral focus ring
            // @ts-ignore
            '--tw-ring-color': 'var(--tribes-focus-ring-neutral)',
          }}
          aria-label="Account menu"
        >
          {getInitials()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 rounded-lg bg-white border-[var(--tribes-border-subtle)]"
        sideOffset={8}
      >
        <div className="px-3 py-2.5">
          <p 
            className="text-[13px] font-medium truncate"
            style={{ color: 'var(--tribes-text)' }}
          >
            {profile?.full_name || profile?.email}
          </p>
          <p 
            className="text-[10px] uppercase tracking-wider mt-1"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            Help Workstation
          </p>
        </div>
        
        <DropdownMenuSeparator className="bg-[var(--tribes-border-subtle)]" />
        
        <DropdownMenuItem
          onClick={() => navigate("/account")}
          className="text-[13px] py-2 focus:bg-[var(--tribes-nav-hover)]"
          style={{ color: 'var(--tribes-text-muted)' }}
        >
          <Settings size={16} strokeWidth={1.5} className="mr-2 opacity-70" />
          {NAV_LABELS.ACCOUNT_SETTINGS}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-[var(--tribes-border-subtle)]" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-[13px] py-2 text-red-600 focus:bg-red-50"
        >
          <LogOut size={16} strokeWidth={1.5} className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WorkspaceSelector() {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      )}
      style={{
        // @ts-ignore
        '--tw-ring-color': 'var(--tribes-focus-ring-neutral)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--tribes-nav-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Avatar */}
      <div 
        className="h-7 w-7 rounded-md flex items-center justify-center text-[11px] font-semibold shrink-0"
        style={{ 
          backgroundColor: '#E5E7EB',
          color: 'var(--tribes-text)',
        }}
      >
        T
      </div>
      
      {/* Text */}
      <span 
        className="flex-1 text-left text-sm font-medium truncate"
        style={{ color: 'var(--tribes-text)' }}
      >
        Tribes Rights
      </span>
      
      {/* Chevron */}
      <ChevronDown 
        className="h-4 w-4 shrink-0"
        strokeWidth={1.5}
        style={{ color: 'var(--tribes-text-muted)' }}
      />
    </button>
  );
}

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
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
          "transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        )}
        style={{
          backgroundColor: isActive ? 'var(--tribes-nav-active)' : 'transparent',
          color: isActive ? 'var(--tribes-text)' : 'var(--tribes-text-muted)',
          // @ts-ignore
          '--tw-ring-color': 'var(--tribes-focus-ring-neutral)',
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
          className="h-[18px] w-[18px] shrink-0" 
          strokeWidth={1.5}
        />
        {item.label}
      </NavLink>
    );
  };

  return (
    <nav className="flex flex-col py-3 px-3">
      {/* Workspace Selector */}
      <div className="mb-4">
        <WorkspaceSelector />
      </div>

      {/* Main Navigation */}
      <div className="space-y-0.5">
        {mainItems.map(renderNavItem)}
      </div>

      {/* Analytics Section */}
      <div 
        className="mt-6 pt-4"
        style={{ borderTop: '1px solid var(--tribes-border-subtle)' }}
      >
        <div className="space-y-0.5">
          {analyticsItems.map(renderNavItem)}
        </div>
      </div>

      {/* Settings Section */}
      <div 
        className="mt-6 pt-4"
        style={{ borderTop: '1px solid var(--tribes-border-subtle)' }}
      >
        <div className="space-y-0.5">
          {settingsItems.map(renderNavItem)}
        </div>
      </div>
    </nav>
  );
}

function HeaderSearch() {
  const [searchValue, setSearchValue] = useState("");
  
  return (
    <div className="w-full max-w-[680px]">
      <AppSearchInput
        value={searchValue}
        onChange={setSearchValue}
        placeholder="Search for anything"
        rightHint="⌘ K"
        size="md"
      />
    </div>
  );
}

export function HelpWorkstationLayout() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
              
              <button
                onClick={() => navigate("/help-workstation")}
                className="font-medium uppercase tracking-wider text-[11px] focus:outline-none"
                style={{ color: 'var(--tribes-text)' }}
              >
                {NAV_LABELS.BRAND_WORDMARK}
              </button>
            </div>

            <HelpAccountMenu />
          </div>
        ) : (
          /* Desktop Header — 3-column grid */
          <div 
            className="h-full grid items-center gap-4"
            style={{ gridTemplateColumns: '1fr minmax(420px, 680px) 1fr' }}
          >
            {/* Left: Back + Wordmark */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/admin")}
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
                aria-label="Back to System Console"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
              
              <button
                onClick={() => navigate("/help-workstation")}
                className={cn(
                  "text-sm font-medium uppercase tracking-wider",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
                )}
                style={{ 
                  color: 'var(--tribes-text)',
                  // @ts-ignore
                  '--tw-ring-color': 'var(--tribes-focus-ring-neutral)',
                }}
              >
                {NAV_LABELS.BRAND_WORDMARK}
              </button>
            </div>

            {/* Center: Search */}
            <div className="flex justify-center">
              <HeaderSearch />
            </div>

            {/* Right: Account */}
            <div className="flex items-center justify-end">
              <HelpAccountMenu />
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar — Mercury-like */}
        {!isMobile && (
          <aside 
            className="w-[260px] shrink-0 overflow-y-auto"
            style={{
              backgroundColor: 'var(--tribes-sidebar-bg-mercury)',
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
    </div>
  );
}
