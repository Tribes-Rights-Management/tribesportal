import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { EmailForm } from "./EmailForm";
import { CheckEmailState } from "./CheckEmailState";
import { SignInHelpDialog } from "./SignInHelpDialog";

type AuthState = "enter-email" | "check-email";

/**
 * AuthSurface - Unified auth component with in-place state transitions
 * Two states: "enter-email" (form) and "check-email" (confirmation)
 * Premium, institutional-grade design. Light mode only.
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

  const handleSubmit = async () => {
    if (!email.trim()) return;

    setIsSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim());
    setIsSubmitting(false);

    if (error) {
      console.error("Sign-in error:", error);
    }
    
    // Transition to "check-email" state and update URL for refresh persistence
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
      {/* Header */}
      <h1 className="text-[24px] font-semibold text-[#111] text-center">
        {state === "enter-email" ? "Sign in to Tribes" : "Check your email"}
      </h1>

      <p className="mt-2 text-[14px] text-[#6B6B6B] text-center">
        {state === "enter-email"
          ? "Secure access via email sign-in link"
          : "We've sent a secure sign-in link to"}
      </p>

      {/* Body */}
      <div className="mt-6">
        {state === "enter-email" ? (
          <EmailForm
            email={email}
            onChange={setEmail}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <CheckEmailState
            email={email}
            onResend={handleResend}
            onChangeEmail={handleChangeEmail}
            isResending={isSubmitting}
            resendMessage={resendMessage}
          />
        )}
      </div>

      {/* Footer - only show in enter-email state */}
      {state === "enter-email" && (
        <>
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
        </>
      )}

      {/* Footer - check-email state */}
      {state === "check-email" && (
        <p className="mt-8 text-center text-[13px] text-black/45">
          Access is restricted to approved accounts.
        </p>
      )}
    </>
  );
}
