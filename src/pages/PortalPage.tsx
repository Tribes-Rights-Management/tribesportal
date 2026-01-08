import { useUserRole } from "@/hooks/useUserRole";
import { PortalLayout } from "@/components/PortalLayout";

export default function PortalPage() {
  const { isAdmin, isModerator } = useUserRole();

  return (
    <PortalLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Welcome to your portal</h2>
          <p className="text-muted-foreground">Your dashboard content will appear here.</p>
        </div>

        {isAdmin && (
          <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <h3 className="font-semibold text-destructive mb-2">Admin Panel</h3>
            <p className="text-sm text-muted-foreground">
              You have administrator access. Use the sidebar to manage users.
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
      </div>
    </PortalLayout>
  );
}
