import { useState } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout, AuthHeader, AuthFooter, AuthSecondaryAction } from "@/components/auth/AuthLayout";

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
    <AuthLayout
      footer={<AuthFooter>Access is restricted to approved accounts.</AuthFooter>}
    >
      <AuthHeader 
        title="Check your email"
        subtitle="We've sent a secure sign-in link to"
      />

      {/* Email Display */}
      <div className="bg-black/[0.03] border border-black/[0.06] rounded-lg py-4 px-5 mb-6">
        <p className="text-[15px] font-medium text-foreground text-center break-all">
          {email}
        </p>
      </div>

      {/* Expiration Notice */}
      <p className="text-[13px] text-black/50 text-center">
        This link expires shortly and can only be used once.
      </p>

      {/* Secondary Actions */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <AuthSecondaryAction onClick={handleResend} disabled={isResending}>
          {isResending ? "Sending..." : "Resend sign-in link"}
        </AuthSecondaryAction>
        <Link 
          to="/auth/sign-in"
          className="text-[13px] text-black/60 hover:text-black transition-colors"
        >
          Use a different email
        </Link>
      </div>
    </AuthLayout>
  );
}
