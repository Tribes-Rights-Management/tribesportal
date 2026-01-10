import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";

export default function LicensingPage() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Licensing Portal</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>You are signed in as licensing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>
                <p className="font-medium capitalize">{profile?.role}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium capitalize">{profile?.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Login:</span>
                <p className="font-medium">
                  {profile?.last_login_at 
                    ? new Date(profile.last_login_at).toLocaleString() 
                    : "First login"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
