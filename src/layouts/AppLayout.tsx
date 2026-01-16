import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalHeader } from "@/components/app/GlobalHeader";
import { LicensingNav } from "@/components/app/LicensingNav";
import { PublishingNav } from "@/components/app/PublishingNav";

/**
 * APP LAYOUT — INSTITUTIONAL STRUCTURE
 * 
 * Layout Rules:
 * - Flat hierarchy, no elevation
 * - No shadows, no animated transitions
 * - Navigation is functional, not expressive
 */
export function AppLayout() {
  const { activeContext } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
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
