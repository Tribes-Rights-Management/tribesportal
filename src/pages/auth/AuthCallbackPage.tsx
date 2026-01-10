import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "error">("verifying");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check URL for error parameters (expired/invalid link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorCode = hashParams.get("error_code");
        const errorDescription = hashParams.get("error_description");
        
        // Handle expired or invalid OTP links
        if (errorCode === "otp_expired" || errorDescription?.includes("expired")) {
          navigate("/auth/link-expired", { replace: true });
          return;
        }
        
        if (errorCode) {
          console.error("Auth error:", errorCode, errorDescription);
          navigate("/auth/error", { replace: true });
          return;
        }

        // Exchange the auth code/hash for a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          // Check if it's an expired link error
          if (sessionError.message?.includes("expired") || sessionError.message?.includes("invalid")) {
            navigate("/auth/link-expired", { replace: true });
            return;
          }
          navigate("/auth/error", { replace: true });
          return;
        }

        if (!session?.user) {
          // No session - may be expired link or invalid
          navigate("/auth/link-expired", { replace: true });
          return;
        }

        // Session established - let RootRedirect handle state resolution
        // This avoids duplicating the accessState logic here
        navigate("/", { replace: true });
        
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setTimeout(() => {
          navigate("/auth/link-expired", { replace: true });
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
