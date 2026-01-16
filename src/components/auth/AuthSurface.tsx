import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SignInHelpDialog } from "./SignInHelpDialog";

type AuthState = "enter-email" | "check-email";

/**
 * AuthSurface - Institutional access control surface (Dark Theme)
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Single stateful surface (NO page transitions)
 * - Dark environment, dark elevated panel
 * - Typography: calm, factual, institutional
 * - Copy: authoritative language, NO SaaS cues
 * - Inputs: administrative, dark-themed
 * - This is access control, not onboarding
 * 
 * VISUAL CONTINUITY:
 * - Must feel continuous with tribesrightsmanagement.com
 * - Same darkness, gravity, and permanence
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
      setResendMessage("Unable to send. Please verify and retry.");
    } else {
      setResendMessage("Access link sent");
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
        <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#6B6B6B]">
          Tribes Rights Management
        </span>
      </div>

      {/* Heading - calm, factual, institutional */}
      <h1 className="text-[22px] font-medium leading-[1.25] text-[#E8E8E6] text-center tracking-[-0.02em]">
        {state === "enter-email" ? "Access Tribes Rights Management" : "Verification pending"}
      </h1>

      {/* Supporting text - institutional, policy-like */}
      <p className="mt-3 text-[14px] leading-[1.5] text-[#8A8A8A] text-center">
        {state === "enter-email"
          ? "Authentication is performed via secure email verification."
          : "A secure access link has been issued to the address below."}
      </p>

      {/* Body */}
      <div className="mt-8">
        {state === "enter-email" ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="email" 
                className="block text-[12px] font-medium text-[#8A8A8A] tracking-[0.02em]"
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
                placeholder="you@organization.com"
                className={[
                  "mt-2 w-full h-12 rounded-lg",
                  "border border-[#3A3A3C] bg-[#252528]",
                  "px-4 text-[15px] text-[#E8E8E6]",
                  "placeholder:text-[#6B6B6B]",
                  "focus:outline-none focus:border-[#4A4A4C] focus:bg-[#2A2A2D]",
                  "transition-colors duration-100",
                ].join(" ")}
              />
            </div>

            <PrimaryButton 
              type="submit" 
              disabled={!email.trim()} 
              loading={isSubmitting}
            >
              Request access link
            </PrimaryButton>
          </form>
        ) : (
          /* Verification Pending State - same panel, same structure */
          <div className="space-y-5">
            {/* Email display - system confirmation, not form field */}
            <div className="w-full rounded-lg border border-[#3A3A3C] bg-[#252528] px-4 py-3.5">
              <div className="truncate text-[15px] font-medium text-[#E8E8E6]">
                {email}
              </div>
            </div>

            {/* Resend feedback */}
            {resendMessage && (
              <p className="text-[13px] leading-[1.5] text-[#E8E8E6] text-center font-medium">
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
                Resend access link
              </PrimaryButton>

              {/* Secondary action - visually recedes */}
              <button
                type="button"
                onClick={handleChangeEmail}
                className="w-full text-center text-[13px] font-medium text-[#6B6B6B] hover:text-[#8A8A8A] py-2 transition-colors duration-100"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Policy notice - institutional rule, firm */}
      <p className="mt-8 text-center text-[12px] leading-[1.5] text-[#6B6B6B]">
        Access is restricted to approved accounts.
      </p>

      {/* Support link - de-emphasized, procedural */}
      <p className="mt-2 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-[12px] text-[#6B6B6B] hover:text-[#8A8A8A] transition-colors duration-100"
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
