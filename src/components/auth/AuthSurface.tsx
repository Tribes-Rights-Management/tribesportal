import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignInHelpDialog } from "./SignInHelpDialog";

type AuthState = "enter-email" | "check-email";

/**
 * AuthSurface — Institutional Access Gateway (CANONICAL)
 * 
 * DESIGN CONSTRAINTS (NON-NEGOTIABLE):
 * - Dark canvas, no card UI
 * - Left-aligned text preferred
 * - Sharp/restrained radius (≤8px)
 * - Same surface for all states (no page changes)
 * - Minimal motion (fades only)
 * 
 * LANGUAGE STANDARD:
 * - "Authenticate" / "Secure Access"
 * - "Send verification link" (not "Continue")
 * - "Verification link sent" (not "Check your email")
 * - "Access assistance" (not "Trouble signing in?")
 * 
 * Security signaling through restraint, not symbols.
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
      setResendMessage("Unable to send. Verify address.");
    } else {
      setResendMessage("Verification link sent");
    }
  };

  const handleChangeEmail = () => {
    setState("enter-email");
    setEmail("");
    setResendMessage(null);
    setSearchParams({}, { replace: true });
  };

  // Color tokens derived from CSS variables (YouTube Studio-inspired soft dark)
  const colors = {
    heading: 'var(--auth-heading)',
    body: 'var(--auth-body)',
    muted: 'var(--auth-muted)',
    label: 'var(--auth-label)',
    inputBg: 'var(--auth-input-bg)',
    inputBorder: 'var(--auth-input-border)',
    inputBorderFocus: 'var(--auth-input-border-focus)',
    inputText: 'var(--auth-input-text)',
    buttonBg: 'var(--auth-button-bg)',
    buttonText: 'var(--auth-button-text)',
    buttonHover: 'var(--auth-button-hover)',
    buttonDisabledBg: 'var(--auth-button-disabled-bg)',
    buttonDisabledText: 'var(--auth-button-disabled-text)',
  };

  // Input styles — dark canvas, visible border
  const inputStyles: React.CSSProperties = {
    width: '100%',
    height: 'var(--auth-input-height)',
    borderRadius: 'var(--auth-border-radius)',
    border: `1px solid ${colors.inputBorder}`,
    backgroundColor: colors.inputBg,
    padding: '0 14px',
    fontSize: 'var(--auth-font-scale)',
    color: colors.inputText,
    outline: 'none',
    transition: 'border-color 150ms ease',
  };

  // Button styles — solid, institutional
  const buttonStyles = (disabled: boolean): React.CSSProperties => ({
    width: '100%',
    height: '48px',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 500,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? colors.buttonDisabledBg : colors.buttonBg,
    color: disabled ? colors.buttonDisabledText : colors.buttonText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 100ms ease, opacity 100ms ease',
  });

  return (
    <>
      {/* System identifier — uppercase, letter-spaced, muted */}
      <div style={{ marginBottom: '40px' }}>
        <span 
          style={{ 
            fontSize: '10px', 
            fontWeight: 500, 
            letterSpacing: '0.16em', 
            textTransform: 'uppercase',
            color: colors.muted,
          }}
        >
          Tribes Rights Management
        </span>
      </div>

      {/* Primary heading — medium weight, institutional */}
      <h1 
        style={{ 
          fontSize: '28px', 
          fontWeight: 500, 
          lineHeight: 1.2,
          color: colors.heading,
          letterSpacing: '-0.02em',
          margin: 0,
        }}
      >
        {state === "enter-email" ? "Secure Access" : "Verification link sent"}
      </h1>

      {/* Subtext — one line, neutral, factual */}
      <p 
        style={{ 
          marginTop: '12px', 
          fontSize: '14px', 
          lineHeight: 1.5,
          color: colors.body,
        }}
      >
        {state === "enter-email"
          ? "Access is granted via secure email verification."
          : "A secure access link has been sent to:"}
      </p>

      {/* Body */}
      <div style={{ marginTop: '32px' }}>
        {state === "enter-email" ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label 
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.label,
                  marginBottom: '8px',
                }}
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
                placeholder="name@organization.com"
                style={inputStyles}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.inputBorderFocus;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.inputBorder;
                }}
              />
            </div>

            {/* Primary action */}
            <button
              type="submit"
              disabled={!email.trim() || isSubmitting}
              style={{ ...buttonStyles(!email.trim() || isSubmitting), marginTop: '20px' }}
              onMouseOver={(e) => {
                if (email.trim() && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = colors.buttonHover;
                }
              }}
              onMouseOut={(e) => {
                if (email.trim() && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = colors.buttonBg;
                }
              }}
            >
              {isSubmitting ? "Processing" : "Send verification link"}
            </button>
          </form>
        ) : (
          /* Verification state — same surface, content changes only */
          <div>
            {/* Email display — bordered record field */}
            <div
              style={{
                ...inputStyles,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.02)',
                color: colors.heading,
                fontWeight: 500,
                cursor: 'default',
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
                color: colors.muted,
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
                  color: colors.body,
                }}
              >
                {resendMessage}
              </p>
            )}

            {/* Actions */}
            <div style={{ marginTop: '24px' }}>
              {/* Primary: Resend */}
              <button
                type="button"
                onClick={handleResend}
                disabled={isSubmitting || !email.trim()}
                style={buttonStyles(isSubmitting || !email.trim())}
                onMouseOver={(e) => {
                  if (email.trim() && !isSubmitting) {
                    e.currentTarget.style.backgroundColor = colors.buttonHover;
                  }
                }}
                onMouseOut={(e) => {
                  if (email.trim() && !isSubmitting) {
                    e.currentTarget.style.backgroundColor = colors.buttonBg;
                  }
                }}
              >
                {isSubmitting ? "Processing" : "Resend verification link"}
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
                  color: colors.muted,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'color 100ms ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = colors.body;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = colors.muted;
                }}
              >
                Use a different email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer — restrained, institutional */}
      <p 
        style={{ 
          marginTop: '48px', 
          fontSize: '12px', 
          lineHeight: 1.5,
          color: colors.muted,
        }}
      >
        Access is restricted to approved accounts.
      </p>

      {/* Support link — minimal emphasis */}
      <p style={{ marginTop: '8px' }}>
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '12px',
            color: colors.muted,
            cursor: 'pointer',
            textDecoration: 'none',
            padding: 0,
            transition: 'color 100ms ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = colors.body;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = colors.muted;
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
