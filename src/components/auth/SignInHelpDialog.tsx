import { useState } from "react";
import {
  AppModal,
  AppModalBody,
  AppModalFooter,
  AppModalAction,
} from "@/components/ui/app-modal";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

interface SignInHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onResendLink: () => Promise<{ error: Error | null }>;
}

/**
 * SignInHelpDialog — Institutional access assistance modal
 * 
 * DESIGN: Uses unified AppModal system
 * Dark theme, minimal, functional, no friendly language
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
    <AppModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Access assistance"
      maxWidth="sm"
    >
      <AppModalBody>
        {/* Intro */}
        <p 
          className="text-[14px] leading-relaxed"
          style={{ color: 'var(--platform-text-secondary)' }}
        >
          Tribes uses secure email verification links.
        </p>

        {/* Troubleshooting list */}
        <div className="mt-4">
          <p 
            className="text-[14px] leading-relaxed mb-2"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            If verification fails:
          </p>
          <ul className="pl-4 space-y-1">
            <li 
              className="text-[14px] leading-relaxed list-disc"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Confirm the email address is correct.
            </li>
            <li 
              className="text-[14px] leading-relaxed list-disc"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Check spam or junk folders.
            </li>
            <li 
              className="text-[14px] leading-relaxed list-disc"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Links expire and are single-use.
            </li>
          </ul>
        </div>

        {/* Support row */}
        <div className="mt-5 flex items-center gap-2">
          <span 
            className="text-[12px]"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Support
          </span>
          <span 
            className="text-[13px]"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            {supportEmail}
          </span>
          <button
            onClick={handleCopyEmail}
            className="flex items-center justify-center transition-opacity hover:opacity-70 focus:outline-none ml-1"
            aria-label="Copy email address"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: 'hsl(var(--success, 120 20% 49%))' }} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: 'var(--platform-text-muted)' }} />
            )}
          </button>
        </div>

        {/* Footer note */}
        <p 
          className="mt-3 text-[12px] leading-relaxed"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Access is restricted to approved accounts.
        </p>
      </AppModalBody>

      <AppModalFooter>
        <AppModalAction
          onClick={handleResendLink}
          loading={isResending}
          loadingText="Sending"
          disabled={!email.trim()}
        >
          Resend verification link
        </AppModalAction>
      </AppModalFooter>
    </AppModal>
  );
}
