import { useState, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignInHelpDialog } from "@/components/auth/SignInHelpDialog";
import { AuthLayout } from "@/layouts/AuthLayout";

type AuthState = "idle" | "sent";

/**
 * SignInPage - Unified auth surface with in-place state transitions
 * Two states: "idle" (email input) and "sent" (confirmation view)
 * Premium, institutional-grade design. Light mode only.
 */
export default function SignInPage() {
  const { user, profile, loading, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Restore state from URL params if present
  const initialState: AuthState = searchParams.get("sent") === "1" ? "sent" : "idle";
  const initialEmail = searchParams.get("email") || "";
  
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  // Clear resend message after 3 seconds
  useEffect(() => {
    if (resendMessage) {
      const timer = setTimeout(() => setResendMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [resendMessage]);

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
    
    // Transition to "sent" state and update URL for refresh persistence
    setAuthState("sent");
    setSearchParams({ sent: "1", email: encodeURIComponent(email.trim()) }, { replace: true });
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim());
    setIsSubmitting(false);

    if (error) {
      setResendMessage("Unable to send. Please try again.");
    } else {
      setResendMessage("Sign-in link sent");
    }
  };

  const handleUseDifferentEmail = () => {
    setAuthState("idle");
    setEmail("");
    setResendMessage(null);
    setSearchParams({}, { replace: true });
    // Focus will be handled by autoFocus on the input
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

  // ═══════════════════════════════════════════════════════════════════════════════
  // SENT STATE - Confirmation view
  // ═══════════════════════════════════════════════════════════════════════════════
  if (authState === "sent") {
    return (
      <AuthLayout>
        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] leading-[1.25] text-[#111]">
            Check your email
          </h1>
          <p className="mt-2.5 text-[15px] leading-[1.6] text-[#6B7280]">
            We sent a secure sign-in link to
          </p>
        </div>

        {/* Email Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex justify-center px-4 py-3 rounded-[12px] border border-black/10 bg-white">
            <span className="text-[15px] font-medium text-[#111] break-all">
              {email}
            </span>
          </div>
        </div>

        {/* Fine Print */}
        <p className="text-[14px] leading-[1.5] text-center text-[#6B7280] mb-8">
          This link expires shortly and can be used once.
        </p>

        {/* Inline Resend Message */}
        {resendMessage && (
          <p className="text-[14px] text-center text-[#111] mb-4 font-medium">
            {resendMessage}
          </p>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {/* Primary: Resend */}
          <button
            onClick={handleResend}
            disabled={isSubmitting}
            className="w-full h-[44px] inline-flex items-center justify-center text-center px-4 rounded-[12px] bg-[#111111] text-white text-[15px] font-semibold leading-[20px] tracking-[-0.01em] transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7] disabled:bg-[#a3a3a3] disabled:cursor-not-allowed"
          >
            <span className="text-center">{isSubmitting ? "Sending..." : "Resend sign-in link"}</span>
          </button>

          {/* Secondary: Use different email */}
          <button
            onClick={handleUseDifferentEmail}
            className="w-full h-[44px] inline-flex items-center justify-center text-center text-[15px] text-[#6B7280] hover:text-[#374151] transition-colors duration-150"
          >
            Use a different email
          </button>
        </div>

        {/* Institutional Notice */}
        <p className="mt-8 text-center text-[13px] text-black/45">
          Access is restricted to approved accounts.
        </p>
      </AuthLayout>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // IDLE STATE - Email input form
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <AuthLayout>
      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] leading-[1.25] text-[#111]">
          Sign in to Tribes
        </h1>
        <p className="mt-2.5 text-[15px] leading-[1.6] text-[#6B7280]">
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
            className="w-full h-[44px] px-3.5 text-[15px] rounded-[10px] bg-white border border-black/10 text-black/90 placeholder:text-black/35 outline-none transition-shadow duration-150 focus:ring-1 focus:ring-black/20"
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
