import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/contexts/AuthContext";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "error">("verifying");

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

        // Fetch the user's profile and role separately
        const [profileResult, roleResult] = await Promise.all([
          supabase
            .from("user_profiles")
            .select("id, email, status, created_at, last_login_at")
            .eq("id", session.user.id)
            .is("deleted_at", null)
            .maybeSingle(),
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle()
        ]);

        if (profileResult.error || !profileResult.data) {
          console.error("Profile error:", profileResult.error);
          // User authenticated but no profile exists
          await supabase.auth.signOut();
          navigate("/auth/error", { replace: true });
          return;
        }

        if (roleResult.error || !roleResult.data) {
          console.error("Role error:", roleResult.error);
          // User has profile but no role assigned
          await supabase.auth.signOut();
          navigate("/auth/error", { replace: true });
          return;
        }

        const userStatus = profileResult.data.status;
        const userRole = roleResult.data.role as UserRole;

        // Check status
        if (userStatus !== "active") {
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

        const targetRoute = roleRoutes[userRole];
        if (targetRoute) {
          navigate(targetRoute, { replace: true });
        } else {
          navigate("/auth/error", { replace: true });
        }
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setTimeout(() => {
          navigate("/auth/error", { replace: true });
        }, 1500);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center">
        <p className="text-[15px] text-[#6B6B6B] tracking-wide">
          {status === "error" ? "Access verification failed" : "Verifying access..."}
        </p>
      </div>
    </div>
  );
}
