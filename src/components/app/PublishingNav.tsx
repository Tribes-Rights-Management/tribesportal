import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
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
