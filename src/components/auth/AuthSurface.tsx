import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignInHelpDialog } from "./SignInHelpDialog";

type AuthState = "enter-email" | "check-email";

/**
 * AuthSurface - Institutional Access Gateway (AUTHORITATIVE — SECTION 2)
 * 
 * DESIGN CONSTRAINTS (NON-NEGOTIABLE):
 * - Uses locked auth tokens from CSS custom properties
 * - No friendly or marketing language
 * - No playful spacing, shadows, or animations
 * - Same surface for all states (no page changes)
 * 
 * LANGUAGE STANDARD:
 * - "Access Tribes" (not "Sign in to Tribes")
 * - "Request access link" (not "Continue")
 * - "Verification link sent" (not "Check your email")
 * - "Access assistance" (not "Trouble signing in?")
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

  // Shared input styles using auth tokens
  const inputStyles: React.CSSProperties = {
    width: '100%',
    height: 'var(--auth-input-height)',
    borderRadius: 'var(--auth-border-radius)',
    border: '1px solid var(--auth-input-border)',
    backgroundColor: '#FFFFFF',
    padding: '0 16px',
    fontSize: 'var(--auth-font-scale)',
    color: 'var(--auth-heading)',
    outline: 'none',
  };

  // Shared button styles using auth tokens
  const buttonStyles = (disabled: boolean): React.CSSProperties => ({
    width: '100%',
    height: 'var(--auth-button-height)',
    borderRadius: 'var(--auth-border-radius)',
    fontSize: 'var(--auth-font-scale)',
    fontWeight: 500,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? 'var(--auth-button-disabled-bg)' : 'var(--auth-button-bg)',
    color: disabled ? 'var(--auth-button-disabled-text)' : 'var(--auth-button-text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <>
      {/* System identifier — uppercase, letter-spaced, muted */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <span 
          style={{ 
            fontSize: '10px', 
            fontWeight: 500, 
            letterSpacing: '0.12em', 
            textTransform: 'uppercase',
            color: 'var(--auth-system-label)',
          }}
        >
          Tribes Rights Management System
        </span>
      </div>

      {/* Primary heading — medium weight, not bold */}
      <h1 
        style={{ 
          fontSize: '22px', 
          fontWeight: 500, 
          lineHeight: 1.3,
          color: 'var(--auth-heading)',
          textAlign: 'center',
          letterSpacing: '-0.01em',
          margin: 0,
        }}
      >
        {state === "enter-email" ? "Access Tribes" : "Verification link sent"}
      </h1>

      {/* Subtext — one line only, neutral, informational */}
      <p 
        style={{ 
          marginTop: '12px', 
          fontSize: '14px', 
          lineHeight: 1.5,
          color: 'var(--auth-subtext)',
          textAlign: 'center',
        }}
      >
        {state === "enter-email"
          ? "Access is granted via secure email verification."
          : "A secure access link has been sent to:"}
      </p>

      {/* Body */}
      <div style={{ marginTop: '28px' }}>
        {state === "enter-email" ? (
          <form onSubmit={handleSubmit}>
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
                placeholder="name@organization.com"
                style={inputStyles}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--auth-input-border-focus)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--auth-input-border)';
                }}
              />
            </div>

            {/* Primary action — solid, dark neutral */}
            <button
              type="submit"
              disabled={!email.trim() || isSubmitting}
              style={{ ...buttonStyles(!email.trim() || isSubmitting), marginTop: '16px' }}
            >
              {isSubmitting ? "Processing" : "Request access link"}
            </button>
          </form>
        ) : (
          /* Verification state — same surface, content changes only */
          <div>
            {/* Email display — bordered, non-editable field (treated as record) */}
            <div
              style={{
                ...inputStyles,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FAFAFA',
                color: 'var(--auth-heading)',
                fontWeight: 500,
              }}
            >
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                width: '100%',
              }}>
                {email}
              </span>
            </div>

            {/* Security note */}
            <p 
              style={{ 
                marginTop: '16px',
                fontSize: '13px', 
                lineHeight: 1.5, 
                color: 'var(--auth-subtext)',
                textAlign: 'center',
              }}
            >
              This link expires shortly and may be used once.
            </p>

            {/* Resend feedback */}
            {resendMessage && (
              <p 
                style={{ 
                  marginTop: '12px',
                  fontSize: '13px', 
                  lineHeight: 1.5, 
                  color: 'var(--auth-label)',
                  textAlign: 'center',
                }}
              >
                {resendMessage}
              </p>
            )}

            {/* Actions */}
            <div style={{ marginTop: '20px' }}>
              {/* Primary: Resend */}
              <button
                type="button"
                onClick={handleResend}
                disabled={isSubmitting || !email.trim()}
                style={buttonStyles(isSubmitting || !email.trim())}
              >
                {isSubmitting ? "Processing" : "Resend access link"}
              </button>

              {/* Secondary: Change email — text link, muted */}
              <button
                type="button"
                onClick={handleChangeEmail}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '8px 0',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  color: 'var(--auth-subtext)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Use a different email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer — restrained */}
      <p 
        style={{ 
          marginTop: '32px', 
          fontSize: '12px', 
          lineHeight: 1.5,
          color: 'var(--auth-system-label)',
          textAlign: 'center',
        }}
      >
        Access is restricted to approved accounts.
      </p>

      {/* Support link — minimal emphasis */}
      <p style={{ marginTop: '8px', textAlign: 'center' }}>
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '12px',
            color: 'var(--auth-subtext)',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
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
