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
 * Navigation Rules:
 * - Functional, not expressive
 * - Flat hierarchy, clear groupings
 * - No novelty patterns
 */

const navItems = [
  { to: "/app/publishing", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/publishing/works", label: "Works", icon: Music },
  { to: "/app/publishing/splits", label: "Splits & Ownership", icon: GitBranch },
  { to: "/app/publishing/registrations", label: "Registrations", icon: FileCheck },
  { to: "/app/publishing/statements", label: "Statements", icon: Receipt },
  { to: "/app/publishing/payments", label: "Payments", icon: CreditCard },
  { to: "/app/publishing/documents", label: "Documents", icon: FolderOpen },
];

const settingsItems = [
  { to: "/app/publishing/settings", label: "Settings", icon: Settings },
];

export function PublishingNav() {
  return <SideNav items={navItems} settingsItems={settingsItems} />;
}
