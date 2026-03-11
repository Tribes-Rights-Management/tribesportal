import { SideNav } from "@/components/app/SideNav";
import {
  LayoutDashboard,
  Music,
  GitBranch,
  FileCheck,
  Receipt,
  CreditCard,
  FolderOpen,
  Settings,
} from "lucide-react";

/**
 * PUBLISHING NAVIGATION
 * 
 * Serves the legacy /app/publishing route family.
 * These routes are retained for backward compatibility only.
 * Canonical client-facing workspace is /admin (Tribes Admin).
 */

const navItems = [
  { to: "/app/publishing", label: "Overview", icon: LayoutDashboard, exact: true, section: "main" as const },
  { to: "/app/publishing/works", label: "Works", icon: Music, section: "main" as const },
  { to: "/app/publishing/splits", label: "Splits & Ownership", icon: GitBranch, section: "main" as const },
  { to: "/app/publishing/registrations", label: "Registrations", icon: FileCheck, section: "main" as const },
  { to: "/app/publishing/statements", label: "Statements", icon: Receipt, section: "main" as const },
  { to: "/app/publishing/payments", label: "Payments", icon: CreditCard, section: "main" as const },
  { to: "/app/publishing/documents", label: "Documents", icon: FolderOpen, section: "main" as const },
  { to: "/app/publishing/settings", label: "Configuration", icon: Settings, section: "settings" as const },
];

export function PublishingNav() {
  return <SideNav items={navItems} />;
}
