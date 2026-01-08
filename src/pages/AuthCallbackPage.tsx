import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";

type ErrorType = "expired" | "invalid" | "generic" | null;

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signInWithMagicLink } = useAuth();
  const [error, setError] = useState<ErrorType>(null);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendConfirmed, setResendConfirmed] = useState(false);

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    // Check for error in URL params
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (errorParam) {
      const desc = errorDescription?.toLowerCase() || "";
      if (desc.includes("expired") || desc.includes("otp")) {
        setError("expired");
      } else if (desc.includes("invalid") || desc.includes("not found")) {
        setError("invalid");
      } else {
        setError("generic");
      }
      return;
    }

    // Try to exchange the token
    try {
      const { error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("generic");
        return;
      }

      // Success - redirect to portal
      navigate("/portal", { replace: true });
    } catch (err) {
      console.error("Callback error:", err);
      setError("generic");
    }
  }

  async function handleResend() {
    if (!email.trim()) return;
    
    setIsResending(true);
    const { error: resendError } = await signInWithMagicLink(email);
    setIsResending(false);

    if (!resendError) {
      setResendConfirmed(true);
    }
  }

  function handleBack() {
    navigate("/auth", { replace: true });
  }

  // Loading state
  if (!error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Expired link
  if (error === "expired") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <h1 className="mb-2">This link has expired</h1>
            <p className="text-sm text-muted-foreground mb-6">
              For security, sign-in links expire after a short time.
            </p>
            {resendConfirmed ? (
              <p className="text-sm text-muted-foreground">
                A new link has been sent.
              </p>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-input rounded-md bg-background"
                  aria-label="Email address"
                />
                <button
                  onClick={handleResend}
                  disabled={isResending || !email.trim()}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {isResending ? "…" : "Resend link"}
                </button>
                <div>
                  <button
                    onClick={handleBack}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Invalid link
  if (error === "invalid") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <h1 className="mb-2">This link isn't valid</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The sign-in link may be incorrect or no longer available.
            </p>
            {resendConfirmed ? (
              <p className="text-sm text-muted-foreground">
                A new link has been sent.
              </p>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-input rounded-md bg-background"
                  aria-label="Email address"
                />
                <button
                  onClick={handleResend}
                  disabled={isResending || !email.trim()}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {isResending ? "…" : "Resend link"}
                </button>
                <div>
                  <button
                    onClick={handleBack}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Generic error
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Please try again.
          </p>
          <button
            onClick={handleBack}
            className="h-10 px-6 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Footer now uses canonical component imported above
