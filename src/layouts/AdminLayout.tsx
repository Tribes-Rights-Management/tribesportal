import { Outlet } from "react-router-dom";
import { GlobalHeader } from "@/components/app/GlobalHeader";

export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
