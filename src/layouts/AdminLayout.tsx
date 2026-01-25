import { Outlet } from "react-router-dom";
import { GlobalHeader } from "@/components/app/GlobalHeader";

/**
 * ADMIN LAYOUT — CONSOLE LIGHT (Stripe-like)
 * 
 * Layout Rules:
 * - Light canvas with white surfaces
 * - Subtle borders, no heavy shadows
 * - Institutional command center aesthetic
 * 
 * Role-based Entry:
 * - Platform admins land here by default
 * - This is the institutional control surface
 */
export function AdminLayout() {
  return (
    <div 
      className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip"
      style={{ backgroundColor: 'var(--app-canvas-bg)' }}
    >
      <GlobalHeader />
      <main className="flex-1 overflow-y-auto overflow-x-clip min-w-0 w-full max-w-full">
        <Outlet />
      </main>
    </div>
  );
}
