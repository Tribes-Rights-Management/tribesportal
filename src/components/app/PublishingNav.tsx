import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Library,
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
  { to: "/app/publishing/catalog", label: "Catalog", icon: Library },
  { to: "/app/publishing/works", label: "Works", icon: Music },
  { to: "/app/publishing/splits", label: "Splits & Ownership", icon: GitBranch },
  { to: "/app/publishing/registrations", label: "Registrations", icon: FileCheck },
  { to: "/app/publishing/statements", label: "Statements", icon: Receipt },
  { to: "/app/publishing/payments", label: "Payments", icon: CreditCard },
  { to: "/app/publishing/documents", label: "Documents", icon: FolderOpen },
  { to: "/app/publishing/settings", label: "Settings", icon: Settings },
];

export function PublishingNav() {
  return (
    <nav className="w-56 border-r border-[#E4E4E7] bg-[#FAFAFA] py-4">
      <div className="px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-md transition-colors",
                isActive
                  ? "bg-white text-[#0A0A0A] shadow-sm border border-[#E4E4E7]"
                  : "text-[#71717A] hover:text-[#3F3F46] hover:bg-white/50"
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
