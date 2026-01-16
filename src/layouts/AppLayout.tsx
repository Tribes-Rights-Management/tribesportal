import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalHeader } from "@/components/app/GlobalHeader";
import { LicensingNav } from "@/components/app/LicensingNav";
import { PublishingNav } from "@/components/app/PublishingNav";

/**
 * APP LAYOUT — INSTITUTIONAL DARK CANVAS (CANONICAL)
 * 
 * Layout Rules:
 * - Dark canvas persists after login (no light mode switch)
 * - Flat hierarchy, no elevation
 * - No shadows, no animated transitions
 * - Navigation is functional, not expressive
 * - Seamless continuation from marketing + auth
 */
export function AppLayout() {
  const { activeContext } = useAuth();

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <GlobalHeader />
      <div className="flex flex-1 overflow-hidden">
        {activeContext === "licensing" && <LicensingNav />}
        {activeContext === "publishing" && <PublishingNav />}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
