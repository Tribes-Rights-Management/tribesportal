import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

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

  // Reset support email visibility when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShowSupportEmail(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        hideDefaultClose
        className="w-[92vw] max-w-[520px] rounded-[16px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.08)] p-6 sm:p-8"
      >
        {/* Custom close button */}
        <button
          onClick={() => handleOpenChange(false)}
          className="absolute right-5 top-5 p-1.5 rounded-md opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="space-y-0 pb-0 pr-8">
          <DialogTitle className="text-[18px] font-semibold text-foreground tracking-[-0.01em]">
            Trouble signing in?
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-5">
          {/* Intro line */}
          <p className="text-[15px] leading-[1.6] text-neutral-700">
            Tribes uses secure email sign-in links.
          </p>

          {/* Troubleshooting list */}
          <div>
            <p className="text-[15px] leading-[1.6] text-neutral-700 mb-3">
              If you're having trouble:
            </p>
            <ul className="space-y-2 text-[14px] leading-[1.6] text-neutral-600">
              <li className="flex items-start gap-2.5">
                <span className="text-neutral-400 mt-px select-none">•</span>
                <span>Confirm you entered the correct email address.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-neutral-400 mt-px select-none">•</span>
                <span>Check your spam or junk folder.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-neutral-400 mt-px select-none">•</span>
                <span>Sign-in links expire quickly and can be used once.</span>
              </li>
            </ul>
          </div>

          {/* Primary action */}
          <div className="pt-2">
            <button
              onClick={handleResendLink}
              disabled={isResending || !email.trim()}
              className="h-12 w-full rounded-xl bg-[#111] text-white text-[15px] font-medium transition-colors hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
            >
              {isResending ? "Sending..." : "Resend sign-in link"}
            </button>
          </div>

          {/* Support section (reveal-only, no mailto) */}
          <div className="pt-1">
            {!showSupportEmail ? (
              <button
                onClick={() => setShowSupportEmail(true)}
                className="text-[13px] text-neutral-600 hover:text-black underline-offset-4 hover:underline transition-colors"
              >
                Contact support
              </button>
            ) : (
              <p className="mt-2 text-[13px] text-neutral-500">
                {supportEmail}
              </p>
            )}
          </div>

          {/* Footer - quiet restriction line */}
          <p className="text-[13px] leading-[1.5] text-neutral-500 pt-1">
            Access is restricted to approved accounts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
