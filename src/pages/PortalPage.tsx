import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

export default function PortalPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{BRAND.wordmark} Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Welcome to your portal</h2>
        <p className="text-muted-foreground">
          Your dashboard content will appear here.
        </p>
      </main>
    </div>
  );
}
