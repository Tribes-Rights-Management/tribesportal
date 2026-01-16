import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SignInHelpDialog } from "./SignInHelpDialog";

type AuthState = "enter-email" | "check-email";

/**
 * AuthSurface - Institutional-grade identity verification surface
 * 
 * LOCKED DESIGN STANDARD:
 * - Single stateful surface (NO page transitions)
 * - Card remains fixed, only content changes
 * - NO animations, NO fades, NO delight effects
 * - Typography: medium weight, calm authority
 * - Copy: policy statements, NOT marketing tone
 * 
 * Light mode only. Institutional-grade.
 */
export function AuthSurface() {
  const { signInWithMagicLink } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Restore state from URL params if present
  const initialState: AuthState = searchParams.get("sent") === "1" ? "check-email" : "enter-email";
  const initialEmail = searchParams.get("email") ? decodeURIComponent(searchParams.get("email")!) : "";
  
  const [state, setState] = useState<AuthState>(initialState);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim());
    setIsSubmitting(false);

    if (error) {
      console.error("Sign-in error:", error);
    }
    
    // Immediate state change - no animation
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
      {/* Heading - Same size/weight across states */}
      <h1 className="text-[22px] font-medium leading-[1.3] text-[#111] text-center">
        {state === "enter-email" ? "Sign in to Tribes" : "Check your email"}
      </h1>

      {/* Subtext - Policy statement, NOT marketing */}
      <p className="mt-3 text-[14px] leading-[1.5] text-[#6B6B6B] text-center">
        {state === "enter-email"
          ? "Access is granted via secure email verification."
          : "A secure sign-in link has been sent to:"}
      </p>

      {/* Body - Content changes only, no layout shift */}
      <div className="mt-6">
        {state === "enter-email" ? (
          /* Enter Email State */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-[13px] font-medium text-[#6B6B6B]"
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
                  "mt-2 w-full h-[46px] rounded-[10px]",
                  "border border-[#D4D4D4] bg-white",
                  "px-4 text-[15px] text-[#111]",
                  "placeholder:text-[#9CA3AF]",
                  "focus:outline-none focus:border-[#999]",
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
          /* Check Email State - Same card, same position */
          <div className="space-y-5">
            {/* Email display - Static system field, NOT editable */}
            <div className="w-full rounded-[10px] border border-[#D4D4D4] bg-[#FAFAFA] px-4 py-3">
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

              {/* Secondary action - de-emphasized, no underline */}
              <button
                type="button"
                onClick={handleChangeEmail}
                className="w-full text-center text-[14px] font-medium text-[#6B6B6B] hover:text-[#111] py-2"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Policy Notice - Separated, treated as a rule */}
      <p className="mt-6 text-center text-[13px] leading-[1.5] text-[#9CA3AF]">
        Access is restricted to approved accounts.
      </p>

      {/* Support Link - De-emphasized, procedural */}
      <p className="mt-3 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-[13px] text-[#9CA3AF] hover:text-[#6B6B6B]"
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
