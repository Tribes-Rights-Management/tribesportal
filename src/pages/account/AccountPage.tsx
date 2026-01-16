import { Outlet, NavLink, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalHeader } from "@/components/app/GlobalHeader";
import { User, Shield, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ACCOUNT SETTINGS HUB — INSTITUTIONAL GOVERNANCE SURFACE
 * 
 * Route: /account
 * Subroutes: /account/profile, /account/security, /account/preferences
 * 
 * Design Rules:
 * - Real pages, never a 404
 * - Functional sections only (no placeholders, no "Coming Soon")
 * - Institutional, restrained styling
 * - Read-only organizational data where applicable
 * - No "Connected Accounts" section
 */

const accountNavItems = [
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/security", label: "Security", icon: Shield },
  { to: "/account/preferences", label: "Preferences", icon: Sliders },
];

function AccountNav() {
  return (
    <nav 
      className="w-56 shrink-0 border-r py-6 px-4"
      style={{ 
        backgroundColor: 'var(--platform-surface)',
        borderColor: 'var(--platform-border)'
      }}
    >
      <div className="space-y-1">
        {accountNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-colors",
              isActive 
                ? "text-[--platform-text] bg-white/5" 
                : "text-[--platform-text-muted] hover:text-[--platform-text] hover:bg-white/3"
            )}
          >
            <item.icon className="h-4 w-4 opacity-70" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function AccountPage() {
  const { profile, loading, accessState } = useAuth();
  const location = useLocation();
  
  // Redirect to profile by default
  if (location.pathname === "/account") {
    return <Navigate to="/account/profile" replace />;
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <GlobalHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px]" style={{ color: 'var(--platform-text-muted)' }}>
            Loading account
          </p>
        </div>
      </div>
    );
  }

  if (accessState === "unauthenticated") {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <GlobalHeader />
      <div className="flex flex-1 overflow-hidden">
        <AccountNav />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
