import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "error">("verifying");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange the auth code/hash for a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          navigate("/auth/error", { replace: true });
          return;
        }

        if (!session?.user) {
          // No session - may be expired link or invalid
          navigate("/auth/sign-in", { replace: true });
          return;
        }

        // Session established - let RootRedirect handle state resolution
        // This avoids duplicating the accessState logic here
        navigate("/", { replace: true });
        
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
          {status === "error" ? "Session verification failed" : "Establishing session..."}
        </p>
      </div>
    </div>
  );
}
