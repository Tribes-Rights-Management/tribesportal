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
      <div className="text-center mb-7">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] leading-[1.15] text-black/90">
          Check your email
        </h1>
        <p className="mt-2.5 text-[15px] text-black/55">
          We've sent a secure sign-in link to
        </p>
      </div>

      {/* Email Display */}
      <div className="rounded-[10px] py-3.5 px-4 mb-6 bg-neutral-50 border border-black/8">
        <p className="text-[15px] font-medium text-center break-all text-black/85">
          {email}
        </p>
      </div>

      {/* Expiration Notice */}
      <p className="text-[14px] text-center text-black/55">
        This link expires shortly and can only be used once.
      </p>

      {/* Secondary Actions */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-[14px] text-black/55 hover:text-black/80 transition-colors duration-150 disabled:opacity-45"
        >
          {isResending ? "Sending..." : "Resend sign-in link"}
        </button>
        <Link 
          to="/auth/sign-in"
          className="text-[14px] text-black/55 hover:text-black/80 transition-colors duration-150"
        >
          Use a different email
        </Link>
      </div>
    </AuthLayout>
  );
}
