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
        className="max-w-[520px] w-[92vw] bg-white border border-black/[0.06] rounded-2xl p-6 sm:p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.08),0_20px_25px_-5px_rgba(0,0,0,0.06)]"
      >
        {/* Custom close button */}
        <button
          onClick={() => handleOpenChange(false)}
          className="absolute right-5 top-5 p-1 rounded-sm opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="space-y-0 pb-0 pr-6">
          <DialogTitle className="text-lg font-semibold text-foreground tracking-[-0.01em]">
            Trouble signing in?
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Explanation */}
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Tribes uses secure email sign-in links.
          </p>

          {/* Troubleshooting list */}
          <div className="text-[15px] text-muted-foreground leading-[1.6]">
            <p className="mb-3">If you're having trouble:</p>
            <ul className="space-y-2.5 ml-1">
              <li className="flex items-start gap-3">
                <span className="text-[#777] mt-0.5 select-none">•</span>
                <span>Confirm you entered the correct email address</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#777] mt-0.5 select-none">•</span>
                <span>Check your spam or junk folder</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#777] mt-0.5 select-none">•</span>
                <span>Sign-in links expire after a short time</span>
              </li>
            </ul>
          </div>

          {/* Primary action */}
          <div className="pt-1">
            <button
              onClick={handleResendLink}
              disabled={isResending || !email.trim()}
              className="w-full h-12 bg-[#111] hover:bg-[#1a1a1a] active:bg-[#0a0a0a] disabled:bg-[#111]/50 disabled:cursor-not-allowed text-white text-[15px] font-medium rounded-[11px] transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2"
            >
              {isResending ? "Sending..." : "Resend sign-in link"}
            </button>
          </div>

          {/* Support section */}
          <div className="pt-1">
            {!showSupportEmail ? (
              <button
                onClick={() => setShowSupportEmail(true)}
                className="text-[13px] text-muted-foreground/70 hover:text-muted-foreground transition-colors"
              >
                Contact support
              </button>
            ) : (
              <p className="text-[13px] text-muted-foreground/60">
                {supportEmail}
              </p>
            )}
          </div>

          {/* Footer */}
          <p className="text-[12px] text-muted-foreground/50 pt-2">
            Access is restricted to approved accounts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
