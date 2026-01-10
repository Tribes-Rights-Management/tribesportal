import { useState } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email;
  const { signInWithMagicLink } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  // If no email in state, redirect to sign-in
  if (!email) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  const handleResend = async () => {
    setIsResending(true);
    const { error } = await signInWithMagicLink(email);
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0A0A0A] tracking-[-0.02em] leading-tight">
            Check your email
          </h1>
          <p className="mt-3 text-[15px] text-[#6B6B6B] leading-relaxed">
            A sign-in link has been sent to
          </p>
        </div>

        {/* Email Display */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[6px] py-4 px-5 mb-8">
          <p className="text-[15px] font-medium text-[#0A0A0A] text-center break-all">
            {email}
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 text-center">
          <p className="text-[14px] text-[#52525B] leading-relaxed">
            Click the link in your email to sign in.
          </p>
          <p className="text-[13px] text-[#A1A1AA]">
            This link expires shortly and can only be used once.
          </p>
        </div>

        {/* Resend */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={isResending}
            className="text-[13px] text-[#71717A] hover:text-[#0A0A0A] hover:bg-transparent"
          >
            {isResending ? "Sending..." : "Resend sign-in link"}
          </Button>
        </div>

        {/* Back Link */}
        <p className="mt-4 text-center">
          <Link 
            to="/auth/sign-in"
            className="text-[13px] text-[#71717A] hover:text-[#0A0A0A] transition-colors"
          >
            Use a different email
          </Link>
        </p>
      </div>
    </div>
  );
}
