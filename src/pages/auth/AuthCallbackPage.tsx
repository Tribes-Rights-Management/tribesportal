import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, UserRole } from "@/contexts/AuthContext";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          navigate("/auth/error", { replace: true });
          return;
        }

        if (!session?.user) {
          navigate("/auth/sign-in", { replace: true });
          return;
        }

        // Fetch the user's profile
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile) {
          console.error("Profile error:", profileError);
          // User authenticated but no profile exists
          await supabase.auth.signOut();
          navigate("/auth/error", { replace: true });
          return;
        }

        const userProfile = profile as UserProfile;

        // Check status
        if (userProfile.status !== "active") {
          await supabase.auth.signOut();
          navigate("/auth/error", { replace: true });
          return;
        }

        // Update last login
        await supabase
          .from("user_profiles")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", session.user.id);

        // Route based on role
        const roleRoutes: Record<UserRole, string> = {
          admin: "/admin",
          client: "/dashboard",
          licensing: "/licensing",
        };

        const targetRoute = roleRoutes[userProfile.role];
        if (targetRoute) {
          navigate(targetRoute, { replace: true });
        } else {
          navigate("/auth/error", { replace: true });
        }
      } catch (err) {
        console.error("Callback error:", err);
        setError("An unexpected error occurred");
        navigate("/auth/error", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center space-y-2">
        <div className="animate-pulse text-muted-foreground">
          {error ? error : "Signing you in..."}
        </div>
      </div>
    </div>
  );
}
