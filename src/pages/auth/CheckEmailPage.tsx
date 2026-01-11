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
      {/* Header - Marketing site alignment */}
      <div className="text-center mb-6">
        <h1 className="text-[32px] font-bold text-foreground tracking-[-0.02em] leading-[1.125]">
          Check your email
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          We've sent a secure sign-in link to
        </p>
      </div>

      {/* Email Display */}
      <div className="bg-[#f8f9fa] border border-[rgba(0,0,0,0.10)] rounded-[12px] py-4 px-5 mb-6">
        <p className="text-base font-medium text-foreground text-center break-all">
          {email}
        </p>
      </div>

      {/* Expiration Notice */}
      <p className="text-[14px] text-muted-foreground text-center">
        This link expires shortly and can only be used once.
      </p>

      {/* Secondary Actions */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] disabled:opacity-45"
        >
          {isResending ? "Sending..." : "Resend sign-in link"}
        </button>
        <Link 
          to="/auth/sign-in"
          className="text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        >
          Use a different email
        </Link>
      </div>
    </AuthLayout>
  );
}
