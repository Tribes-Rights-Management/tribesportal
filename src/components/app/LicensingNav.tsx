import { SideNav } from "@/components/app/SideNav";
import {
  LayoutDashboard,
  Library,
  FileText,
  Scale,
  FolderOpen,
  Settings,
} from "lucide-react";

/**
 * LICENSING NAVIGATION
 * 
 * Navigation Rules:
 * - Functional, not expressive
 * - Flat hierarchy, clear groupings
 * - No novelty patterns
 */

const navItems = [
  { to: "/app/licensing", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/licensing/catalog", label: "Catalog", icon: Library },
  { to: "/app/licensing/requests", label: "License Requests", icon: FileText },
  { to: "/app/licensing/licenses", label: "Agreements", icon: Scale },
  { to: "/app/licensing/documents", label: "Documents", icon: FolderOpen },
];

const settingsItems = [
  { to: "/app/licensing/settings", label: "Settings", icon: Settings },
];

export function LicensingNav() {
  return <SideNav items={navItems} settingsItems={settingsItems} />;
}
