import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignInHelpDialog } from "./SignInHelpDialog";

type AuthState = "enter-email" | "check-email";

/**
 * AuthSurface - Institutional system boundary (AUTHORITATIVE)
 * 
 * DESIGN CONSTRAINTS (NON-NEGOTIABLE):
 * - NO card-based SaaS UI
 * - NO white or light backgrounds
 * - NO onboarding metaphors
 * - NO friendly or marketing language
 * - NO playful spacing, shadows, or animations
 * 
 * VISUAL STRUCTURE:
 * - Full-viewport dark environment
 * - Typography-driven layout
 * - Minimal color usage
 * - One primary action only
 * 
 * This is access control, not onboarding.
 */
export function AuthSurface() {
  const { signInWithMagicLink } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialState: AuthState = searchParams.get("sent") === "1" ? "check-email" : "enter-email";
  const initialEmail = searchParams.get("email") ? decodeURIComponent(searchParams.get("email")!) : "";
  
  const [state, setState] = useState<AuthState>(initialState);
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  useEffect(() => {
    if (resendMessage) {
      const timer = setTimeout(() => setResendMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [resendMessage]);

  const handleResendLink = async () => {
    return signInWithMagicLink(email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim());
    setIsSubmitting(false);

    if (error) {
      console.error("Sign-in error:", error);
    }
    
    setState("check-email");
    setSearchParams({ sent: "1", email: encodeURIComponent(email.trim()) }, { replace: true });
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim());
    setIsSubmitting(false);

    if (error) {
      setResendMessage("Unable to send. Verify address and retry.");
    } else {
      setResendMessage("Access link issued");
    }
  };

  const handleChangeEmail = () => {
    setState("enter-email");
    setEmail("");
    setResendMessage(null);
    setSearchParams({}, { replace: true });
  };

  return (
    <>
      {/* System identifier - uppercase, letter-spaced, low contrast */}
      <div className="mb-10 text-center">
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#4A4A4A]">
          Tribes Rights Management System
        </span>
      </div>

      {/* Primary heading - declarative, not welcoming */}
      <h1 className="text-[24px] font-medium leading-[1.2] text-[#E5E5E3] text-center tracking-[-0.02em]">
        {state === "enter-email" ? "Access Control" : "Verification link issued"}
      </h1>

      {/* Supporting text - neutral, procedural */}
      <p className="mt-4 text-[14px] leading-[1.6] text-[#707070] text-center">
        {state === "enter-email"
          ? "Authentication is performed via secure email verification."
          : "A secure access link has been sent to:"}
      </p>

      {/* Body */}
      <div className="mt-10">
        {state === "enter-email" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.com"
                className={[
                  "w-full h-[52px] rounded-[6px]",
                  "border border-[#2A2A2A] bg-[#141416]",
                  "px-4 text-[15px] text-[#E5E5E3]",
                  "placeholder:text-[#505050]",
                  "focus:outline-none focus:border-[#3A3A3A]",
                  "transition-colors duration-75",
                ].join(" ")}
              />
            </div>

            {/* Primary action - authoritative, not friendly */}
            <button
              type="submit"
              disabled={!email.trim() || isSubmitting}
              className={[
                "w-full h-[52px] rounded-[6px]",
                "text-[15px] font-medium",
                "transition-colors duration-75",
                !email.trim() || isSubmitting
                  ? "bg-[#1A1A1C] text-[#4A4A4A] cursor-not-allowed"
                  : "bg-[#E5E5E3] text-[#0A0A0B] hover:bg-[#D5D5D3]",
              ].join(" ")}
            >
              {isSubmitting ? "Applying changes" : "Request access link"}
            </button>
          </form>
        ) : (
          /* Verification state - same environment, content changes only */
          <div className="space-y-6">
            {/* Email display - system output, not styled input */}
            <div className="text-center">
              <span className="text-[15px] font-medium text-[#E5E5E3]">
                {email}
              </span>
            </div>

            {/* Security note */}
            <p className="text-[13px] leading-[1.5] text-[#505050] text-center">
              This link expires shortly and may be used once.
            </p>

            {/* Resend feedback */}
            {resendMessage && (
              <p className="text-[13px] leading-[1.5] text-[#707070] text-center">
                {resendMessage}
              </p>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {/* Primary: Reissue */}
              <button
                type="button"
                onClick={handleResend}
                disabled={isSubmitting || !email.trim()}
                className={[
                  "w-full h-[52px] rounded-[6px]",
                  "text-[15px] font-medium",
                  "transition-colors duration-75",
                  isSubmitting
                    ? "bg-[#1A1A1C] text-[#4A4A4A] cursor-not-allowed"
                    : "bg-[#E5E5E3] text-[#0A0A0B] hover:bg-[#D5D5D3]",
                ].join(" ")}
              >
                {isSubmitting ? "Applying changes" : "Reissue access link"}
              </button>

              {/* Secondary: Change email - very low emphasis */}
              <button
                type="button"
                onClick={handleChangeEmail}
                className="w-full text-center text-[13px] text-[#505050] hover:text-[#707070] py-2 transition-colors duration-75"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Policy notice - firm, procedural */}
      <p className="mt-12 text-center text-[12px] leading-[1.5] text-[#4A4A4A]">
        Access is restricted to approved accounts.
      </p>

      {/* Support link - minimal emphasis */}
      <p className="mt-3 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-[12px] text-[#4A4A4A] hover:text-[#606060] transition-colors duration-75"
        >
          Access assistance
        </button>
      </p>

      <SignInHelpDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
        email={email}
        onResendLink={handleResendLink}
      />
    </>
  );
}
