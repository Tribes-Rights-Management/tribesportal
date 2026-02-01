import { 
  LayoutDashboard, 
  FileText, 
  Scale, 
  CreditCard,
  FileCheck,
  Receipt,
  FolderOpen,
  Users,
  CheckSquare,
  Building2,
  Shield,
  BarChart3,
  Link2,
  Settings2,
  Music,
  ListTodo,
  type LucideIcon
} from "lucide-react";

/**
 * UNIFIED MODULE NAVIGATION CONFIGURATION
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * This is the single source of truth for all module sidebar navigation.
 * Each module provides only data configuration, not UI.
 * 
 * Modules use the shared SideNav component which renders these items identically.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type ModuleKey = "console" | "admin" | "licensing" | "help" | "tribes-admin";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  section?: "main" | "secondary" | "settings";
}

/**
 * Console Module Navigation - Platform Governance
 */
const consoleNav: NavItem[] = [
  { to: "/console", label: "Overview", icon: LayoutDashboard, exact: true, section: "main" },
  { to: "/console/approvals", label: "Approvals", icon: CheckSquare, section: "main" },
  { to: "/console/tenants", label: "Workspaces", icon: Building2, section: "main" },
  { to: "/console/users", label: "Users", icon: Users, section: "main" },
  { to: "/console/security", label: "Security", icon: Shield, section: "main" },
  { to: "/console/disclosures", label: "Disclosures", icon: FileText, section: "main" },
  { to: "/console/billing", label: "Billing", icon: CreditCard, section: "main" },
  { to: "/console/reporting", label: "Reporting", icon: BarChart3, section: "secondary" },
  { to: "/console/chain", label: "Correlation", icon: Link2, section: "secondary" },
];

/**
 * Admin Module Navigation - Organization Management
 */
const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, section: "main" },
  { to: "/admin/agreements", label: "Agreements", icon: FileCheck, section: "main" },
  { to: "/admin/statements", label: "Statements", icon: Receipt, section: "main" },
  { to: "/admin/documents", label: "Documents", icon: FolderOpen, section: "main" },
  { to: "/admin/payments", label: "Payments", icon: CreditCard, section: "main" },
  { to: "/admin/users", label: "Users", icon: Users, section: "main" },
];

/**
 * Licensing Module Navigation - License Management
 */
const licensingNav: NavItem[] = [
  { to: "/licensing", label: "Overview", icon: LayoutDashboard, exact: true, section: "main" },
  { to: "/licensing/requests", label: "Requests", icon: FileText, section: "main" },
  { to: "/licensing/agreements", label: "Agreements", icon: Scale, section: "main" },
  { to: "/licensing/payments", label: "Payments", icon: CreditCard, section: "main" },
];

/**
 * Help Workstation Navigation - Content Management
 */
const helpNav: NavItem[] = [
  { to: "/help", label: "Overview", icon: LayoutDashboard, exact: true, section: "main" },
  { to: "/help/audiences", label: "Audiences", icon: Users, section: "main" },
  { to: "/help/categories", label: "Categories", icon: FolderOpen, section: "main" },
  { to: "/help/articles", label: "Articles", icon: FileText, section: "main" },
  { to: "/help/analytics", label: "Analytics", icon: BarChart3, section: "secondary" },
  { to: "/help/settings", label: "Settings", icon: Settings2, section: "settings" },
];

/**
 * Tribes Admin Navigation - Song Catalog Management
 */
const tribesAdminNav: NavItem[] = [
  { to: "/tribes-admin", label: "Dashboard", icon: LayoutDashboard, exact: true, section: "main" },
  { to: "/tribes-admin/catalogue", label: "Catalogue", icon: Music, section: "main" },
  { to: "/tribes-admin/queue", label: "Queue", icon: ListTodo, section: "main" },
  { to: "/tribes-admin/documents", label: "Documents", icon: FileText, section: "main" },
  { to: "/tribes-admin/royalties", label: "Royalties", icon: CreditCard, section: "secondary" },
  { to: "/tribes-admin/settings", label: "Settings", icon: Settings2, section: "settings" },
];

/**
 * Module navigation registry
 */
export const MODULE_NAV: Record<ModuleKey, NavItem[]> = {
  console: consoleNav,
  admin: adminNav,
  licensing: licensingNav,
  help: helpNav,
  "tribes-admin": tribesAdminNav,
};

/**
 * Get navigation items for a specific module
 * @param moduleKey - The module identifier
 * @returns Array of navigation items for the module
 */
export function getNavForModule(moduleKey: ModuleKey): NavItem[] {
  return MODULE_NAV[moduleKey] || [];
}

/**
 * Get module context label for header display
 */
export function getModuleLabel(moduleKey: ModuleKey): string {
  switch (moduleKey) {
    case "console":
      return "System Console";
    case "admin":
      return "Admin Portal";
    case "licensing":
      return "Licensing";
    case "help":
      return "Help Workstation";
    case "tribes-admin":
      return "Tribes Admin";
    default:
      return "";
  }
}

/**
 * Get the home route for a module
 */
export function getModuleHomeRoute(moduleKey: ModuleKey): string {
  switch (moduleKey) {
    case "console":
      return "/console";
    case "admin":
      return "/admin";
    case "licensing":
      return "/licensing";
    case "help":
      return "/help";
    case "tribes-admin":
      return "/tribes-admin";
    default:
      return "/workspaces";
  }
}
