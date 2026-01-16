import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { X, Copy, Check } from "lucide-react";

interface SignInHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onResendLink: () => Promise<{ error: Error | null }>;
}

/**
 * SignInHelpDialog — Institutional access assistance modal
 * 
 * DESIGN: Dark theme to match auth surface
 * Minimal, functional, no friendly language
 */
export function SignInHelpDialog({
  open,
  onOpenChange,
  email,
  onResendLink,
}: SignInHelpDialogProps) {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [copied, setCopied] = useState(false);

  const supportEmail = "contact@tribesassets.com";

  const colors = {
    bg: '#141415',
    border: 'rgba(255,255,255,0.08)',
    heading: '#E8E8E6',
    body: '#8A8A8A',
    muted: '#5A5A5A',
    buttonBg: '#E8E8E6',
    buttonText: '#0A0A0B',
    buttonHover: '#D0D0CE',
  };

  const handleResendLink = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Enter your email address first.",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    setIsResending(true);
    const { error } = await onResendLink();
    setIsResending(false);

    if (error) {
      toast({
        title: "Unable to send",
        description: "Try again or contact support.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verification link sent",
        description: "Check your inbox.",
      });
      onOpenChange(false);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast({
        title: "Unable to copy",
        description: supportEmail,
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCopied(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        hideDefaultClose
        className="w-[min(400px,calc(100vw-48px))] max-w-[400px] p-0 border-0 bg-transparent shadow-none"
        overlayClassName="bg-black/60 backdrop-blur-[2px]"
      >
        <div
          style={{
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <DialogTitle 
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: colors.heading,
                letterSpacing: '-0.01em',
              }}
            >
              Access assistance
            </DialogTitle>
            <button
              onClick={() => handleOpenChange(false)}
              className="flex items-center justify-center transition-opacity hover:opacity-70 focus:outline-none"
              aria-label="Close dialog"
              type="button"
            >
              <X 
                className="h-4 w-4" 
                strokeWidth={1.5} 
                style={{ color: colors.muted }}
              />
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            {/* Intro */}
            <p style={{ fontSize: '14px', lineHeight: 1.5, color: colors.body }}>
              Tribes uses secure email verification links.
            </p>

            {/* Troubleshooting list */}
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '14px', lineHeight: 1.5, color: colors.body, marginBottom: '8px' }}>
                If verification fails:
              </p>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                <li style={{ fontSize: '14px', lineHeight: 1.6, color: colors.body, marginBottom: '4px' }}>
                  Confirm the email address is correct.
                </li>
                <li style={{ fontSize: '14px', lineHeight: 1.6, color: colors.body, marginBottom: '4px' }}>
                  Check spam or junk folders.
                </li>
                <li style={{ fontSize: '14px', lineHeight: 1.6, color: colors.body }}>
                  Links expire and are single-use.
                </li>
              </ul>
            </div>

            {/* Primary action */}
            <div style={{ marginTop: '24px' }}>
              <button
                onClick={handleResendLink}
                disabled={isResending || !email.trim()}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: isResending || !email.trim() ? 'not-allowed' : 'pointer',
                  backgroundColor: isResending || !email.trim() ? 'rgba(255,255,255,0.08)' : colors.buttonBg,
                  color: isResending || !email.trim() ? colors.muted : colors.buttonText,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 100ms ease',
                }}
                onMouseOver={(e) => {
                  if (!isResending && email.trim()) {
                    e.currentTarget.style.backgroundColor = colors.buttonHover;
                  }
                }}
                onMouseOut={(e) => {
                  if (!isResending && email.trim()) {
                    e.currentTarget.style.backgroundColor = colors.buttonBg;
                  }
                }}
              >
                {isResending ? "Sending" : "Resend verification link"}
              </button>
            </div>

            {/* Support row */}
            <div 
              style={{ 
                marginTop: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}
            >
              <span style={{ fontSize: '12px', color: colors.muted }}>Support</span>
              <span style={{ fontSize: '13px', color: colors.body }}>{supportEmail}</span>
              <button
                onClick={handleCopyEmail}
                className="flex items-center justify-center transition-opacity hover:opacity-70 focus:outline-none"
                aria-label="Copy email address"
                style={{ marginLeft: '4px' }}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: '#6B8E6B' }} />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: colors.muted }} />
                )}
              </button>
            </div>

            {/* Footer */}
            <p style={{ marginTop: '12px', fontSize: '12px', lineHeight: 1.5, color: colors.muted }}>
              Access is restricted to approved accounts.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
