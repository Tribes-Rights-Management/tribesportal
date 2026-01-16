import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SignInHelpDialog } from "./SignInHelpDialog";

type AuthState = "enter-email" | "check-email";

/**
 * AuthSurface - Unified auth component with in-place state transitions
 * Two states: "enter-email" (form) and "check-email" (confirmation)
 * 
 * LOCKED DESIGN TOKENS:
 * - H1: 24px, font-semibold, color #111, centered
 * - Body/subtitle: 14px, color #6B6B6B, centered
 * - Input: h-11, rounded-[12px], border black/10
 * - Button: h-11, rounded-[12px], bg #111, centered label
 * - State transition: 150ms ease-out fade + translateY
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
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const transitionToState = (newState: AuthState) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setState(newState);
      setIsTransitioning(false);
    }, 150);
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
    
    // Transition to "check-email" state with animation
    transitionToState("check-email");
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
    transitionToState("enter-email");
    setEmail("");
    setResendMessage(null);
    setSearchParams({}, { replace: true });
  };

  return (
    <>
      {/* Header - Fixed position, stable across states */}
      <h1 className="text-[24px] font-semibold leading-[1.3] text-[#111] text-center">
        {state === "enter-email" ? "Sign in to Tribes" : "Check your email"}
      </h1>

      <p className="mt-2 text-[14px] leading-[1.5] text-[#6B6B6B] text-center">
        {state === "enter-email"
          ? "Secure access via email sign-in link"
          : "We've sent a secure sign-in link to"}
      </p>

      {/* Body - Animated content only */}
      <div 
        className="mt-6 transition-all duration-150 ease-out"
        style={{ 
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateY(4px)' : 'translateY(0)'
        }}
      >
        {state === "enter-email" ? (
          /* Email Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-[13px] font-medium text-black/70"
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
                  "mt-2 w-full h-11 rounded-[12px]",
                  "border border-black/10 bg-white",
                  "px-4 text-[15px] text-[#111]",
                  "placeholder:text-black/35",
                  "shadow-[inset_0_1px_0_rgba(0,0,0,0.04)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  "transition-shadow duration-150",
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
          /* Check Email State - Institutional grade */
          <div className="space-y-6">
            {/* Identity row */}
            <div className="text-left">
              <div className="text-[13px] font-medium text-black/55">Sending link to</div>
              <div className="mt-2 w-full min-w-0 rounded-[12px] border border-black/10 bg-[#FAFAFB] px-4 py-3">
                <div className="truncate text-[15px] font-semibold text-[#111]">
                  {email}
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="rounded-[12px] border border-black/10 bg-white px-4 py-3">
              <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-black/40">
                Security
              </div>
              <div className="mt-1 text-[13px] leading-[1.35] text-black/45">
                Links expire shortly and can only be used once.
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

              <button
                type="button"
                onClick={handleChangeEmail}
                className="w-full text-center text-[15px] font-medium text-black/55 hover:text-black transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7] rounded-[10px] py-2"
              >
                Use a different email
              </button>
            </div>

            {/* Divider and access policy */}
            <div className="pt-2 border-t border-black/5 text-center text-[13px] leading-5 text-black/45">
              Access is restricted to approved accounts.
            </div>
          </div>
        )}
      </div>

      {/* Footer - Only show in enter-email state */}
      {state === "enter-email" && (
        <p className="mt-6 text-center text-[13px] leading-[1.5] text-[#9CA3AF]">
          Access is restricted to approved accounts.
        </p>
      )}

      {/* Help Link - only show in enter-email state */}
      {state === "enter-email" && (
        <>
          <p className="mt-2 text-center">
            <button 
              type="button"
              onClick={() => setHelpDialogOpen(true)}
              className="text-[13px] text-[#9CA3AF] hover:text-[#6B6B6B] hover:underline transition-colors duration-150"
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
      )}
    </>
  );
}
