import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AUTH_GRACE_KEY } from "@/constants/session-timeout";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "error">("verifying");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check URL hash for error parameters (expired/invalid link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorCode = hashParams.get("error_code");
        const errorDescription = hashParams.get("error_description");
        
        // Also check query params (some flows use query instead of hash)
        const queryParams = new URLSearchParams(window.location.search);
        const queryError = queryParams.get("error");
        const queryErrorDescription = queryParams.get("error_description");
        
        // Handle expired or invalid OTP links
        const isExpiredError = 
          errorCode === "otp_expired" || 
          errorDescription?.toLowerCase().includes("expired") ||
          errorDescription?.toLowerCase().includes("invalid") ||
          queryError === "access_denied" ||
          queryErrorDescription?.toLowerCase().includes("expired") ||
          queryErrorDescription?.toLowerCase().includes("invalid");
          
        if (isExpiredError) {
          navigate("/auth/link-expired", { replace: true });
          return;
        }
        
        if (errorCode || queryError) {
          console.error("Auth error:", errorCode || queryError, errorDescription || queryErrorDescription);
          navigate("/auth/error", { replace: true });
          return;
        }

        // Exchange the auth code/hash for a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          // Check if it's an expired/invalid link error
          const msg = sessionError.message?.toLowerCase() || "";
          if (msg.includes("expired") || msg.includes("invalid") || msg.includes("otp")) {
            navigate("/auth/link-expired", { replace: true });
            return;
          }
          navigate("/auth/error", { replace: true });
          return;
        }

        // Check if we had auth params but no session (indicates expired/used link)
        const hadAuthParams = 
          window.location.hash.includes("access_token") || 
          window.location.hash.includes("error") ||
          window.location.search.includes("code=");
          
        if (!session?.user) {
          if (hadAuthParams) {
            // Had auth params but no session = expired/invalid link
            navigate("/auth/link-expired", { replace: true });
          } else {
            // No auth params, no session = just visiting callback directly
            navigate("/auth/sign-in", { replace: true });
          }
          return;
        }

        // ═══════════════════════════════════════════════════════════════════════
        // SUCCESSFUL AUTHENTICATION - START GRACE PERIOD
        // ═══════════════════════════════════════════════════════════════════════
        // 
        // Set the grace period marker BEFORE navigating away.
        // This prevents session timeout checks from triggering immediately
        // after the user is redirected to the app.
        localStorage.setItem(AUTH_GRACE_KEY, Date.now().toString());

        // Session established - let RootRedirect handle state resolution
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
