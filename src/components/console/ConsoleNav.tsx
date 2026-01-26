import { SideNav } from "@/components/app/SideNav";
import { getNavForModule } from "@/config/moduleNav";

/**
 * CONSOLE NAVIGATION — UNIFIED PATTERN
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Uses the centralized nav config from src/config/moduleNav.ts.
 * Renders with the shared SideNav component.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function ConsoleNav() {
  const navItems = getNavForModule("console");
  return <SideNav items={navItems} />;
}
