import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy } from "lucide-react";

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
        description: `Check your inbox at ${email}`,
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
      // Fallback for browsers without clipboard API
      toast({
        title: "Copy failed",
        description: supportEmail,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] bg-white border-[#E4E4E7] p-6">
        <DialogHeader className="space-y-0 pb-0">
          <DialogTitle className="text-[18px] font-medium text-[#0A0A0A] tracking-[-0.01em]">
            Trouble signing in?
          </DialogTitle>
        </DialogHeader>

        <div className="mt-5 space-y-5">
          {/* Explanation */}
          <p className="text-[14px] text-[#52525B] leading-relaxed">
            Tribes uses secure email sign-in links.
          </p>

          {/* Troubleshooting list */}
          <div className="text-[14px] text-[#52525B] leading-relaxed">
            <p className="mb-2">If you're having trouble:</p>
            <ul className="space-y-1.5 ml-1">
              <li className="flex items-start gap-2">
                <span className="text-[#A1A1AA] mt-0.5">•</span>
                <span>Confirm you entered the correct email address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A1A1AA] mt-0.5">•</span>
                <span>Check your spam or junk folder</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A1A1AA] mt-0.5">•</span>
                <span>Sign-in links expire after a short time</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-1">
            <Button
              onClick={handleResendLink}
              disabled={isResending || !email.trim()}
              className="w-full h-10 bg-[#0A0A0A] hover:bg-[#171717] text-white text-[14px] font-medium rounded-[6px]"
            >
              {isResending ? "Sending..." : "Resend sign-in link"}
            </Button>

            {/* Support section */}
            <div className="pt-2">
              <p className="text-[13px] text-[#71717A] mb-2">Contact support</p>
              <button
                onClick={handleCopyEmail}
                className="group flex items-center gap-2 text-[14px] text-[#52525B] hover:text-[#0A0A0A] transition-colors"
              >
                <span className="font-mono">{supportEmail}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-[12px] text-[#A1A1AA] pt-1">
            Access is restricted to approved accounts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
