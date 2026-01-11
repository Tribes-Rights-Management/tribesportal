import { useState } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/layouts/AuthLayout";

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
    <AuthLayout>
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-[22px] font-medium text-[#0A0A0A] tracking-[-0.01em] leading-tight">
          Check your email
        </h1>
        <p className="mt-2 text-[13px] text-[#71717A]">
          We've sent a secure sign-in link to
        </p>
      </div>

      {/* Email Display */}
      <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[5px] py-3 px-4 mb-5">
        <p className="text-[14px] font-medium text-[#0A0A0A] text-center break-all">
          {email}
        </p>
      </div>

      {/* Expiration Notice */}
      <p className="text-[12px] text-[#A1A1AA] text-center">
        This link expires shortly and can only be used once.
      </p>

      {/* Secondary Actions */}
      <div className="mt-7 flex flex-col items-center gap-2">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-[12px] text-[#71717A] hover:text-[#0A0A0A] transition-colors disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Resend sign-in link"}
        </button>
        <Link 
          to="/auth/sign-in"
          className="text-[12px] text-[#71717A] hover:text-[#0A0A0A] transition-colors"
        >
          Use a different email
        </Link>
      </div>
    </AuthLayout>
  );
}
