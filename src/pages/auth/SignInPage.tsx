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
        <p className="text-center text-[15px] text-black/60">
          Verifying access...
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] leading-[1.15] text-black/90">
          Sign in to Tribes
        </h1>
        <p className="mt-2.5 text-[15px] text-black/55">
          Secure access via email sign-in link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label 
            htmlFor="email" 
            className="text-[14px] font-medium block text-black/85"
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
            className="w-full h-11 px-3.5 text-[15px] rounded-[10px] bg-white border border-black/10 text-black/90 placeholder:text-black/35 outline-none transition-shadow duration-150 focus:ring-2 focus:ring-black/15"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !email.trim()}
          className="w-full h-[44px] inline-flex items-center justify-center text-center px-4 rounded-[12px] bg-[#111111] text-white text-[15px] font-semibold leading-[20px] tracking-[-0.01em] transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7] disabled:bg-[#a3a3a3] disabled:cursor-not-allowed"
        >
          <span className="text-center">{isSubmitting ? "Sending..." : "Continue"}</span>
        </button>
      </form>

      {/* Institutional Notice */}
      <p className="mt-6 text-center text-[13px] text-black/45">
        Access is restricted to approved accounts.
      </p>

      {/* Help Link */}
      <p className="mt-2 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-[13px] text-black/45 hover:text-black/70 hover:underline transition-colors duration-150"
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
