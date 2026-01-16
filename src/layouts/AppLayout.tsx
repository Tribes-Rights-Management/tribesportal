import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalHeader } from "@/components/app/GlobalHeader";
import { LicensingNav } from "@/components/app/LicensingNav";
import { PublishingNav } from "@/components/app/PublishingNav";
import { AppFooter } from "@/components/app/AppFooter";
import { WorkspaceContextBar } from "@/components/app/WorkspaceContextBar";

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

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--tribes-bg-page)' }}
    >
      <GlobalHeader />
      <WorkspaceContextBar />
      <div className="flex flex-1 overflow-hidden">
        {activeContext === "licensing" && <LicensingNav />}
        {activeContext === "publishing" && <PublishingNav />}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
}
