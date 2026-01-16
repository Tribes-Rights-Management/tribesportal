import { Outlet } from "react-router-dom";
import { GlobalHeader } from "@/components/app/GlobalHeader";

/**
 * ADMIN LAYOUT — GOVERNANCE COMMAND CENTER
 * 
 * Layout Rules:
 * - Flat hierarchy, no elevation
 * - No shadows, no animated transitions
 * - Navigation is functional, not expressive
 * 
 * Role-based Entry:
 * - Platform admins land here by default
 * - This is the institutional control surface
 */
export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
      <GlobalHeader />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
