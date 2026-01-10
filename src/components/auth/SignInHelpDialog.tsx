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
  const [showSupportEmail, setShowSupportEmail] = useState(false);
  const [copied, setCopied] = useState(false);

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
      setTimeout(() => setCopied(false), 2000);
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
      setShowSupportEmail(false);
      setCopied(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        hideDefaultClose
        className="w-[min(520px,calc(100vw-48px))] max-w-[520px] rounded-[16px] border border-black/8 bg-white p-7 shadow-[0_16px_48px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]"
        overlayClassName="bg-black/40 backdrop-blur-[4px]"
      >
        {/* Close button - 32px hit area, 16px icon */}
        <button
          onClick={() => handleOpenChange(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-1"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-[#6B7280] transition-colors group-hover:text-[#374151]" strokeWidth={1.5} />
        </button>

        <DialogHeader className="space-y-0 pb-0 pr-10">
          <DialogTitle className="text-[17px] font-semibold text-foreground tracking-[-0.01em]">
            Trouble signing in?
          </DialogTitle>
        </DialogHeader>

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
                <span>Sign-in links expire quickly and can be used once.</span>
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

          {/* Support email row - compact single line with icon-only copy */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[13px] text-black/45">Support</span>
            <span className="text-[13px] text-black/70 font-mono tracking-tight">{supportEmail}</span>
            <button
              onClick={handleCopyEmail}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              aria-label={copied ? "Copied" : "Copy email address"}
              title={copied ? "Copied!" : "Copy"}
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" strokeWidth={2} />
              ) : (
                <Copy className="h-4 w-4 text-black/40" strokeWidth={1.5} />
              )}
            </button>
          </div>

          {/* Footer - quiet restriction line */}
          <p className="mt-3 text-[13px] leading-[1.5] text-black/45">
            Access is restricted to approved accounts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
