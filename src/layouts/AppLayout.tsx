import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalHeader } from "@/components/app/GlobalHeader";
import { LicensingNav } from "@/components/app/LicensingNav";
import { PublishingNav } from "@/components/app/PublishingNav";

export function AppLayout() {
  const { activeContext } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader />
      <div className="flex flex-1">
        {activeContext === "licensing" && <LicensingNav />}
        {activeContext === "publishing" && <PublishingNav />}
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
