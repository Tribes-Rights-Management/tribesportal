import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Library,
  FileText,
  Scale,
  BarChart3,
  FolderOpen,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/app/licensing", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/licensing/catalog", label: "Catalog", icon: Library },
  { to: "/app/licensing/requests", label: "Requests", icon: FileText },
  { to: "/app/licensing/licenses", label: "Licenses", icon: Scale },
  { to: "/app/licensing/reports", label: "Reports", icon: BarChart3 },
  { to: "/app/licensing/documents", label: "Documents", icon: FolderOpen },
  { to: "/app/licensing/settings", label: "Settings", icon: Settings },
];

export function LicensingNav() {
  return (
    <nav className="w-56 border-r border-border bg-muted/30 py-4">
      <div className="px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-md transition-colors duration-200",
                isActive
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
