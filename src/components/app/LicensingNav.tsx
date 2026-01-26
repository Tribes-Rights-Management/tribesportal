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
 * LICENSING NAVIGATION (Legacy /app/licensing routes)
 * 
 * Navigation Rules:
 * - Functional, not expressive
 * - Flat hierarchy, clear groupings
 * - No novelty patterns
 */

const navItems = [
  { to: "/app/licensing", label: "Overview", icon: LayoutDashboard, exact: true, section: "main" as const },
  { to: "/app/licensing/catalog", label: "Catalog", icon: Library, section: "main" as const },
  { to: "/app/licensing/requests", label: "License Requests", icon: FileText, section: "main" as const },
  { to: "/app/licensing/licenses", label: "Agreements", icon: Scale, section: "main" as const },
  { to: "/app/licensing/documents", label: "Documents", icon: FolderOpen, section: "main" as const },
  { to: "/app/licensing/settings", label: "Configuration", icon: Settings, section: "settings" as const },
];

export function LicensingNav() {
  return <SideNav items={navItems} />;
}
