import { useRef } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalHeader } from "@/components/app/GlobalHeader";
import { LicensingNav } from "@/components/app/LicensingNav";
import { PublishingNav } from "@/components/app/PublishingNav";
import { AppFooter } from "@/components/app/AppFooter";
import { WorkspaceContextBar } from "@/components/app/WorkspaceContextBar";
import { useScrollReset } from "@/hooks/useScrollReset";

/**
 * APP LAYOUT — INSTITUTIONAL DARK CANVAS (CANONICAL)
 * 
 * Layout Rules:
 * - Dark canvas persists after login (no light mode switch)
 * - Flat hierarchy, no elevation
 * - No shadows, no animated transitions
 * - Navigation is functional, not expressive
 * - Seamless continuation from marketing + auth
 * 
 * WORKSPACE TRANSITION:
 * - When entering from System Console, sidebar appears
 * - Context bar confirms active workspace
 * - Exit to System Console via user menu only
 */
export function AppLayout() {
  const { activeContext } = useAuth();
  const mainRef = useRef<HTMLElement>(null);
  
  // Enforce scroll reset on route changes (per Navigation Enforcement Spec)
  useScrollReset(mainRef);

  return (
    <div 
      className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip"
      style={{ backgroundColor: 'var(--tribes-bg-page)' }}
    >
      <GlobalHeader />
      <WorkspaceContextBar />
      <div className="flex flex-1 overflow-hidden w-full max-w-full">
        {activeContext === "licensing" && <LicensingNav />}
        {activeContext === "publishing" && <PublishingNav />}
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-clip flex flex-col min-w-0 w-full max-w-full">
          <div className="flex-1 min-w-0 w-full max-w-full">
            <Outlet />
          </div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
}
