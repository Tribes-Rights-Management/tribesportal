import { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";

/**
 * HEADER-ONLY LAYOUT - NO SIDEBAR (WORKSPACES PAGE)
 * 
 * Simply wraps AppShell with showSidebar=false.
 * Header is rendered by the shared AppHeader component,
 * ensuring logo position is identical everywhere.
 */

interface HeaderOnlyLayoutProps {
  children: ReactNode;
}

export function HeaderOnlyLayout({ children }: HeaderOnlyLayoutProps) {
  return (
    <AppShell showSidebar={false}>
      {children}
    </AppShell>
  );
}
