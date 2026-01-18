import { Outlet } from "react-router-dom";
import { GlobalHeader } from "@/components/app/GlobalHeader";

/**
 * ADMIN LAYOUT — INSTITUTIONAL COMMAND CENTER (CANONICAL)
 * 
 * Layout Rules:
 * - Dark canvas persists (no light mode switch)
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
    <div 
      className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <GlobalHeader />
      <main className="flex-1 overflow-y-auto overflow-x-clip min-w-0 w-full max-w-full">
        <Outlet />
      </main>
    </div>
  );
}
