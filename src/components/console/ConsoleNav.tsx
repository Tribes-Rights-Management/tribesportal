import { SideNav, type NavItem } from "@/components/app/SideNav";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Building2, 
  Users, 
  Shield,
  FileText,
  CreditCard,
  BarChart3,
  Link2,
} from "lucide-react";

/**
 * CONSOLE NAVIGATION — SYSTEM CONSOLE SIDEBAR
 * 
 * Stripe-like sidebar navigation for the System Console module.
 * Uses the shared SideNav component with console-specific routes.
 */

// Console navigation - organized by function
const consoleNavItems: NavItem[] = [
  { to: "/console", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/console/approvals", label: "Approvals", icon: CheckSquare },
  { to: "/console/tenants", label: "Workspaces", icon: Building2 },
  { to: "/console/users", label: "Users", icon: Users },
  { to: "/console/security", label: "Security", icon: Shield },
  { to: "/console/disclosures", label: "Disclosures", icon: FileText },
  { to: "/console/billing", label: "Billing", icon: CreditCard },
  { to: "/console/reporting", label: "Reporting", icon: BarChart3 },
  { to: "/console/chain", label: "Correlation", icon: Link2 },
];

export function ConsoleNav() {
  return <SideNav items={consoleNavItems} />;
}
