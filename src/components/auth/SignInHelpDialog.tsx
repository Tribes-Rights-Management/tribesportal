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

export function SignInHelpDialog({
  open,
  onOpenChange,
  email,
  onResendLink,
}: SignInHelpDialogProps) {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  const supportEmail = "admin@tribesassets.com";

  const handleResendLink = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
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
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sign-in link sent",
        description: "Check your inbox for a new link.",
      });
      onOpenChange(false);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setShowCopiedTooltip(true);
      setTimeout(() => {
        setCopied(false);
        setShowCopiedTooltip(false);
      }, 1200);
    } catch {
      toast({
        title: "Unable to copy",
        description: supportEmail,
      });
    }
  };

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCopied(false);
      setShowCopiedTooltip(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        hideDefaultClose
        className="w-[min(520px,calc(100vw-48px))] max-w-[520px] rounded-[16px] border border-black/8 bg-white p-6 pt-5 shadow-[0_16px_48px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]"
        overlayClassName="bg-black/40 backdrop-blur-[4px]"
      >
        {/* Header row: title + close icon aligned */}
        <div className="flex items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold text-foreground tracking-[-0.01em]">
            Trouble signing in?
          </DialogTitle>
          <button
            onClick={() => handleOpenChange(false)}
            className="flex items-center justify-center transition-colors hover:text-[#374151] focus:outline-none"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-[#9CA3AF]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-4">
          {/* Intro line */}
          <p className="text-[14px] leading-[1.5] text-black/65">
            Tribes uses secure email sign-in links.
          </p>

          {/* Troubleshooting list */}
          <div className="mt-3">
            <p className="text-[14px] leading-[1.5] text-black/65 mb-2">
              If you're having trouble:
            </p>
            <ul className="space-y-2 text-[14px] leading-[1.5] text-black/65">
              <li className="flex items-start gap-2">
                <span className="text-black/35 mt-px select-none">•</span>
                <span>Confirm you entered the correct email address.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black/35 mt-px select-none">•</span>
                <span>Check your spam or junk folder.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black/35 mt-px select-none">•</span>
                <span>Sign-in links expire quickly and can only be used once.</span>
              </li>
            </ul>
          </div>

          {/* Primary action - Tribes-style button */}
          <div className="mt-5">
            <button
              onClick={handleResendLink}
              disabled={isResending || !email.trim()}
              className="h-11 w-full rounded-[10px] bg-[#111111] px-4 text-[15px] font-medium text-white transition-all hover:bg-[#000000] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
            >
              {isResending ? "Sending..." : "Resend sign-in link"}
            </button>
          </div>

          {/* Support row - compact inline: label + email + icon */}
          <div className="mt-3.5 flex items-center gap-2">
            <span className="text-[12px] text-black/40">Support</span>
            <span className="text-[13px] text-black/55">{supportEmail}</span>
            <div className="relative ml-1">
              <button
                onClick={handleCopyEmail}
                className="flex items-center justify-center p-0.5 transition-colors hover:opacity-70 focus:outline-none cursor-pointer"
                aria-label="Copy email address"
              >
                {copied ? (
                  <Check className="h-[14px] w-[14px] text-emerald-600" strokeWidth={1.5} />
                ) : (
                  <Copy className="h-[14px] w-[14px] text-[#9CA3AF] hover:text-[#6B7280]" strokeWidth={1.5} />
                )}
              </button>
              {/* Copied tooltip */}
              {showCopiedTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-7 px-2 py-1 bg-[#1f1f1f] text-white text-[11px] rounded shadow-sm whitespace-nowrap animate-in fade-in duration-150">
                  Copied
                </div>
              )}
            </div>
          </div>

          {/* Footer - quiet restriction line */}
          <p className="mt-2.5 text-[12px] leading-[1.5] text-black/40">
            Access is restricted to approved accounts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
