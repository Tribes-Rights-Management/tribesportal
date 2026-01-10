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
        className="w-[92vw] max-w-[520px] rounded-2xl border border-black/10 bg-white shadow-xl p-6 sm:p-8"
      >
        {/* Close button - muted, properly sized */}
        <button
          onClick={() => handleOpenChange(false)}
          className="absolute right-5 top-5 p-1 rounded-md text-black/50 hover:text-black/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <DialogHeader className="space-y-0 pb-0 pr-8">
          <DialogTitle className="text-lg font-semibold text-foreground tracking-[-0.01em]">
            Trouble signing in?
          </DialogTitle>
        </DialogHeader>

        <div className="mt-5 space-y-4">
          {/* Intro line */}
          <p className="text-sm leading-relaxed text-black/70">
            Tribes uses secure email sign-in links.
          </p>

          {/* Troubleshooting list */}
          <div>
            <p className="text-sm leading-relaxed text-black/70 mb-2">
              If you're having trouble:
            </p>
            <ul className="space-y-2 text-sm leading-relaxed text-black/70">
              <li className="flex items-start gap-2">
                <span className="text-black/40 mt-px select-none">•</span>
                <span>Confirm you entered the correct email address.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black/40 mt-px select-none">•</span>
                <span>Check your spam or junk folder.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black/40 mt-px select-none">•</span>
                <span>Sign-in links expire quickly and can be used once.</span>
              </li>
            </ul>
          </div>

          {/* Primary action - Tribes standard button */}
          <div className="pt-2">
            <button
              onClick={handleResendLink}
              disabled={isResending || !email.trim()}
              className="h-12 w-full rounded-xl bg-[#101010] text-white text-[15px] font-medium transition-all hover:bg-black/90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
            >
              {isResending ? "Sending..." : "Resend sign-in link"}
            </button>
          </div>

          {/* Support section - reveal + copy-to-clipboard */}
          <div className="pt-1">
            {!showSupportEmail ? (
              <button
                onClick={() => setShowSupportEmail(true)}
                className="text-sm text-black/70 hover:text-black transition-colors focus:outline-none focus-visible:underline"
              >
                Contact support
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-black/60">{supportEmail}</span>
                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-black/60 hover:text-black rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer - quiet restriction line */}
          <p className="text-[13px] leading-relaxed text-black/50 pt-1">
            Access is restricted to approved accounts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
