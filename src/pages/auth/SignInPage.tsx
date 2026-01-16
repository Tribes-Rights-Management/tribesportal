import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignInHelpDialog } from "@/components/auth/SignInHelpDialog";
import { AuthLayout } from "@/layouts/AuthLayout";

export default function SignInPage() {
  const { user, profile, loading, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  const handleResendLink = async () => {
    return signInWithMagicLink(email.trim());
  };

  // If already authenticated with valid profile, redirect to appropriate dashboard
  if (!loading && user && profile) {
    if (profile.status !== "active") {
      return <Navigate to="/auth/error" replace />;
    }
    
    // Platform admins go to admin, everyone else goes to app
    if (profile.platform_role === "platform_admin") {
      return <Navigate to="/admin" replace />;
    }
    
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim());
    setIsSubmitting(false);

    if (error) {
      console.error("Sign-in error:", error);
    }
    
    navigate("/auth/check-email", { state: { email: email.trim() } });
  };

  if (loading) {
    return (
      <AuthLayout>
        <p className="text-center text-base" style={{ color: "rgba(0,0,0,0.62)" }}>
          Verifying access...
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 
          className="text-[28px] font-semibold tracking-tight leading-[1.2]"
          style={{ color: "rgba(0,0,0,0.92)" }}
        >
          Sign in to Tribes
        </h1>
        <p 
          className="mt-2 text-[15px]"
          style={{ color: "rgba(0,0,0,0.62)" }}
        >
          Secure access via email sign-in link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label 
            htmlFor="email" 
            className="text-[14px] font-medium block"
            style={{ color: "rgba(0,0,0,0.92)" }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
            className="w-full h-[44px] px-3.5 text-[15px] rounded-[12px] transition-shadow duration-150"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.10)",
              color: "rgba(0,0,0,0.92)",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.20)";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !email.trim()}
          className="w-full h-[44px] text-[15px] font-medium rounded-[12px] transition-all duration-150 disabled:opacity-40"
          style={{
            background: "rgba(0,0,0,0.92)",
            color: "#ffffff",
          }}
        >
          {isSubmitting ? "Sending..." : "Continue"}
        </button>
      </form>

      {/* Institutional Notice */}
      <p 
        className="mt-5 text-center text-[13px]"
        style={{ color: "rgba(0,0,0,0.46)" }}
      >
        Access is restricted to approved accounts.
      </p>

      {/* Help Link */}
      <p className="mt-2 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-[13px] hover:underline transition-colors duration-150"
          style={{ color: "rgba(0,0,0,0.46)" }}
        >
          Trouble signing in?
        </button>
      </p>

      <SignInHelpDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
        email={email}
        onResendLink={handleResendLink}
      />
    </AuthLayout>
  );
}
