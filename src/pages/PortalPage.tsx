import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BRAND } from "@/lib/brand";

export default function PortalPage() {
  const { user, signOut } = useAuth();
  const { roles, isAdmin, isModerator, loading: rolesLoading } = useUserRole();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{BRAND.wordmark} Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            {!rolesLoading && roles.length > 0 && (
              <div className="flex gap-1">
                {roles.map((role) => (
                  <Badge key={role} variant={role === "admin" ? "destructive" : "secondary"}>
                    {role}
                  </Badge>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Welcome to your portal</h2>
        <p className="text-muted-foreground mb-6">
          Your dashboard content will appear here.
        </p>

        {isAdmin && (
          <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 mb-4">
            <h3 className="font-semibold text-destructive mb-2">Admin Panel</h3>
            <p className="text-sm text-muted-foreground">
              You have administrator access. Admin features will appear here.
            </p>
          </div>
        )}

        {isModerator && !isAdmin && (
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h3 className="font-semibold text-primary mb-2">Moderator Tools</h3>
            <p className="text-sm text-muted-foreground">
              You have moderator access. Moderation tools will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
