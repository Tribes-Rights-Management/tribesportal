import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SignInHelpDialog } from "./SignInHelpDialog";

type AuthState = "enter-email" | "check-email";

/**
 * AuthSurface - Institutional access control surface
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Single stateful surface (NO page transitions)
 * - Dark environment, off-white panel
 * - Typography: calm, factual, unexcited
 * - Copy: institutional language, NO SaaS cues
 * - Inputs: administrative, not friendly
 * - This is access control, not onboarding
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
      <div className="mb-8 text-center">
        <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#8A8A8A]">
          Tribes Rights Management System
        </span>
      </div>

      {/* Heading - calm, factual, unexcited */}
      <h1 className="text-[20px] font-medium leading-[1.3] text-[#111] text-center tracking-[-0.01em]">
        {state === "enter-email" ? "Sign in to Tribes" : "Check your email"}
      </h1>

      {/* Supporting text - institutional, not friendly */}
      <p className="mt-2 text-[14px] leading-[1.5] text-[#6B6B6B] text-center">
        {state === "enter-email"
          ? "Access is granted via secure email verification."
          : "A secure sign-in link has been issued to:"}
      </p>

      {/* Body */}
      <div className="mt-6">
        {state === "enter-email" ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="email" 
                className="block text-[12px] font-medium text-[#6B6B6B] tracking-[0.02em]"
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
                  "mt-2 w-full h-11 rounded-lg",
                  "border border-[#C4C4C4] bg-white",
                  "px-4 text-[15px] text-[#111]",
                  "placeholder:text-[#9CA3AF]",
                  "focus:outline-none focus:border-[#888]",
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
          /* Check Email State - same panel, same structure */
          <div className="space-y-5">
            {/* Email display - system confirmation, not form field */}
            <div className="w-full rounded-lg border border-[#C4C4C4] bg-[#F5F5F3] px-4 py-3">
              <div className="truncate text-[15px] font-medium text-[#111]">
                {email}
              </div>
            </div>

            {/* Resend feedback */}
            {resendMessage && (
              <p className="text-[13px] leading-[1.5] text-[#111] text-center font-medium">
                {resendMessage}
              </p>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <PrimaryButton 
                type="button" 
                onClick={handleResend} 
                disabled={isSubmitting || !email.trim()} 
                loading={isSubmitting}
              >
                Resend sign-in link
              </PrimaryButton>

              {/* Secondary action - visually recedes */}
              <button
                type="button"
                onClick={handleChangeEmail}
                className="w-full text-center text-[13px] font-medium text-[#8A8A8A] hover:text-[#6B6B6B] py-2"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Policy notice - institutional rule */}
      <p className="mt-6 text-center text-[12px] leading-[1.5] text-[#9CA3AF]">
        Access is restricted to approved accounts.
      </p>

      {/* Support link - de-emphasized, procedural */}
      <p className="mt-2 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-[12px] text-[#9CA3AF] hover:text-[#6B6B6B]"
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
