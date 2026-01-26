import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";

/**
 * HEADER-ONLY LAYOUT — NO SIDEBAR
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Used for the Modules Home page (/workstations) where no sidebar is needed.
 * Clean header with logo + user avatar only.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HEADER_HEIGHT = "56px";

interface HeaderOnlyLayoutProps {
  children: ReactNode;
}

export function HeaderOnlyLayout({ children }: HeaderOnlyLayoutProps) {
  const { profile, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profile?.email?.slice(0, 2).toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div 
      className="min-h-screen flex flex-col w-full"
      style={{ backgroundColor: 'var(--app-bg)' }}
    >
      {/* Header — full width */}
      <header 
        className="shrink-0 sticky top-0 z-40 flex items-center justify-between px-6"
        style={{ 
          height: HEADER_HEIGHT,
          backgroundColor: 'var(--topbar-bg)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Left: Logo/Wordmark */}
        <Link 
          to="/workspaces"
          className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
        >
          <span 
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            TRIBES
          </span>
        </Link>

        {/* Right: User Avatar/Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ 
                // @ts-ignore
                '--tw-ring-color': '#0071E3',
              }}
            >
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback 
                  className="text-[12px] font-medium"
                  style={{ 
                    backgroundColor: 'var(--muted-wash)',
                    color: 'var(--text)',
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/account/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" strokeWidth={1.5} />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/account/preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" strokeWidth={1.5} />
                Preferences
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
