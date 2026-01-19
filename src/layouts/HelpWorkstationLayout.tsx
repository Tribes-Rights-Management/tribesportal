import { Outlet, useNavigate, useLocation, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  MessageSquare, 
  BarChart3,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { NAV_LABELS, ICON_SIZE, ICON_STROKE, PORTAL_TYPOGRAPHY, PORTAL_AVATAR } from "@/styles/tokens";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

/**
 * HELP WORKSTATION LAYOUT — FIRST-CLASS WORKSTATION
 * 
 * Dedicated layout for Help content management with its own sidebar navigation.
 * Company-scoped (not workspace-scoped).
 * 
 * Navigation:
 * 1. Overview
 * 2. Articles
 * 3. Categories
 * 4. Messages
 * 5. Analytics
 * 6. Settings (optional)
 * 
 * NOT accessible to:
 * - External auditors
 * - Licensing users
 * - Portal users
 */

const NAV_ITEMS = [
  { 
    path: "/help-workstation", 
    label: "Overview", 
    icon: LayoutDashboard, 
    exact: true 
  },
  { 
    path: "/help-workstation/articles", 
    label: "Articles", 
    icon: FileText 
  },
  { 
    path: "/help-workstation/categories", 
    label: "Categories", 
    icon: FolderOpen 
  },
  { 
    path: "/help-workstation/messages", 
    label: "Messages", 
    icon: MessageSquare 
  },
  { 
    path: "/help-workstation/analytics", 
    label: "Analytics", 
    icon: BarChart3 
  },
  { 
    path: "/help-workstation/settings", 
    label: "Settings", 
    icon: Settings 
  },
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
            "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          )}
          style={{
            height: avatarSize,
            width: avatarSize,
            minHeight: avatarSize,
            minWidth: avatarSize,
            backgroundColor: PORTAL_AVATAR.bgColor,
            color: PORTAL_AVATAR.textColor,
          }}
          aria-label="Account menu"
        >
          {getInitials()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 rounded-lg"
        style={{
          backgroundColor: 'var(--tribes-header-bg)',
          borderColor: 'var(--tribes-border)',
        }}
        sideOffset={8}
      >
        <div className="px-3 py-2.5">
          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--tribes-fg)' }}>
            {profile?.full_name || profile?.email}
          </p>
          <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--tribes-fg-muted)' }}>
            Help Workstation
          </p>
        </div>
        
        <DropdownMenuSeparator style={{ backgroundColor: 'var(--tribes-border)' }} />
        
        <DropdownMenuItem
          onClick={() => navigate("/account")}
          className="text-[13px] py-2 focus:bg-white/5"
          style={{ color: 'var(--tribes-fg-secondary)' }}
        >
          <Settings size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2 opacity-70" />
          {NAV_LABELS.ACCOUNT_SETTINGS}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator style={{ backgroundColor: 'var(--tribes-border)' }} />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-[13px] py-2 text-red-400 focus:bg-white/5 focus:text-red-300"
        >
          <LogOut size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact 
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors duration-100",
              "hover:bg-white/[0.04]",
              isActive 
                ? "bg-white/[0.06] text-white font-medium" 
                : "text-white/60"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function HelpWorkstationLayout() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col",
        "bg-[var(--platform-canvas)]"
      )}
    >
      {/* Header */}
      <header 
        className="h-14 px-4 md:px-6 flex items-center shrink-0 sticky top-0 z-40"
        style={{ 
          backgroundColor: 'var(--tribes-header-bg)',
          borderBottom: '1px solid var(--tribes-border)',
        }}
      >
        {/* Left: Back + Wordmark */}
        <div className="flex items-center gap-3 min-w-0">
          {isMobile ? (
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className={cn(
                "flex items-center justify-center rounded shrink-0",
                "hover:bg-white/[0.04] transition-colors duration-150",
                "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
              )}
              style={{ 
                color: 'var(--tribes-text-secondary)',
                height: '32px',
                width: '32px',
              }}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          ) : (
            <button
              onClick={() => navigate("/admin")}
              className={cn(
                "flex items-center justify-center rounded shrink-0",
                "hover:bg-white/[0.04] transition-colors duration-150",
                "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
              )}
              style={{ 
                color: 'var(--tribes-text-secondary)',
                height: '32px',
                width: '32px',
              }}
              aria-label="Back to System Console"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => navigate("/help-workstation")}
            className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded uppercase"
            style={{
              fontSize: isMobile ? '11px' : PORTAL_TYPOGRAPHY.brandWordmark.size,
              letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
              color: 'var(--tribes-text)',
            }}
          >
            {NAV_LABELS.BRAND_WORDMARK}
          </button>
        </div>

        {/* Center: Workstation label */}
        <div className="flex-1 flex items-center justify-center">
          <span 
            className="text-[10px] md:text-[13px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            Help Workstation
          </span>
        </div>

        {/* Right: Account */}
        <div className="flex items-center">
          <HelpAccountMenu />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Desktop */}
        {!isMobile && (
          <aside 
            className="w-56 shrink-0 overflow-y-auto"
            style={{
              backgroundColor: 'var(--tribes-header-bg)',
              borderRight: '1px solid var(--tribes-border)',
            }}
          >
            <SidebarNav />
          </aside>
        )}

        {/* Mobile Nav Overlay */}
        {isMobile && mobileNavOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside 
              className="fixed left-0 top-14 bottom-0 w-64 z-40 overflow-y-auto"
              style={{
                backgroundColor: 'var(--tribes-header-bg)',
              }}
            >
              <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
