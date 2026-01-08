import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PortalSidebar } from "@/components/PortalSidebar";
import { PortalMeta } from "@/components/PortalMeta";
import { BRAND } from "@/lib/brand";

interface PortalLayoutProps {
  children: ReactNode;
  title?: string;
}

export function PortalLayout({ children, title }: PortalLayoutProps) {
  const { user, signOut } = useAuth();
  const { roles, loading: rolesLoading } = useUserRole();

  return (
    <SidebarProvider>
      <PortalMeta title={title} />
      <div className="min-h-screen flex w-full bg-background">
        <PortalSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="font-semibold">{title || BRAND.wordmark}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
              {!rolesLoading && roles.length > 0 && (
                <div className="flex gap-1">
                  {roles.map((role) => (
                    <Badge key={role} variant={role === "admin" ? "destructive" : "secondary"} className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
