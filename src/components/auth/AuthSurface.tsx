import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SignInHelpDialog } from "./SignInHelpDialog";

type AuthState = "enter-email" | "check-email";

/**
 * AuthSurface - Institutional dark access control surface
 * 
 * DESIGN STANDARD (AUTHORITATIVE - DARK):
 * - Single stateful surface (NO page transitions)
 * - Dark charcoal environment
 * - Typography: calm, neutral, administrative
 * - Copy: institutional language, NO SaaS cues
 * - Text: soft light gray (#C8C8C6), never pure white
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
      setResendMessage("Unable to send. Please try again.");
    } else {
      setResendMessage("Sign-in link sent");
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
      {/* System identifier - subtle, institutional */}
      <div className="mb-6 text-center">
        <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#666]">
          Tribes Rights Management
        </span>
      </div>

      {/* Heading - calm, neutral, administrative */}
      <h1 className="text-[18px] font-medium leading-[1.3] text-[#E8E8E6] text-center tracking-[-0.01em]">
        {state === "enter-email" ? "Sign in to Tribes" : "Check your email"}
      </h1>

      {/* Supporting text - institutional, not friendly */}
      <p className="mt-2 text-[13px] leading-[1.5] text-[#888] text-center">
        {state === "enter-email"
          ? "Access is granted via secure email verification."
          : "A secure sign-in link has been issued to:"}
      </p>

      {/* Body */}
      <div className="mt-6">
        {state === "enter-email" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-[11px] font-medium text-[#888] tracking-[0.02em]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={[
                  "mt-2 w-full h-10 rounded-lg",
                  "border border-[#333] bg-[#141416]",
                  "px-3.5 text-[14px] text-[#E8E8E6]",
                  "placeholder:text-[#555]",
                  "focus:outline-none focus:border-[#555]",
                ].join(" ")}
              />
            </div>

            <PrimaryButton 
              type="submit" 
              disabled={!email.trim()} 
              loading={isSubmitting}
            >
              Continue
            </PrimaryButton>
          </form>
        ) : (
          /* Check Email State - same panel, same background */
          <div className="space-y-4">
            {/* Email display - system confirmation */}
            <div className="w-full rounded-lg border border-[#333] bg-[#141416] px-3.5 py-2.5">
              <div className="truncate text-[14px] font-medium text-[#E8E8E6]">
                {email}
              </div>
            </div>

            {/* Resend feedback */}
            {resendMessage && (
              <p className="text-[12px] leading-[1.5] text-[#C8C8C6] text-center font-medium">
                {resendMessage}
              </p>
            )}

            {/* Actions */}
            <div className="space-y-2.5">
              <PrimaryButton 
                type="button" 
                onClick={handleResend} 
                disabled={isSubmitting || !email.trim()} 
                loading={isSubmitting}
              >
                Resend sign-in link
              </PrimaryButton>

              {/* Secondary action - muted, no theatrics */}
              <button
                type="button"
                onClick={handleChangeEmail}
                className="w-full text-center text-[13px] font-medium text-[#666] hover:text-[#888] py-2"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Policy notice - institutional rule */}
      <p className="mt-6 text-center text-[11px] leading-[1.5] text-[#555]">
        Access is restricted to approved accounts.
      </p>

      {/* Support link - recedes visually */}
      <p className="mt-2 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-[11px] text-[#555] hover:text-[#777]"
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
    </>
  );
}
