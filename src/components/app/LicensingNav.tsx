import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Library,
  FileText,
  Scale,
  FolderOpen,
  Settings,
} from "lucide-react";

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
  return (
    <nav className="w-56 shrink-0 border-r border-border bg-background flex flex-col">
      {/* Main navigation */}
      <div className="flex-1 py-4">
        <div className="px-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-md transition-colors duration-200",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      
      {/* Settings at bottom */}
      <div className="border-t border-border py-3">
        <div className="px-3 space-y-0.5">
          {settingsItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-md transition-colors duration-200",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
