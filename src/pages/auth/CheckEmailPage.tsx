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
      <div className="text-center mb-6">
        <h1 
          className="text-[28px] font-semibold tracking-tight leading-[1.2]"
          style={{ color: "rgba(0,0,0,0.92)" }}
        >
          Check your email
        </h1>
        <p 
          className="mt-3 text-[15px]"
          style={{ color: "rgba(0,0,0,0.62)" }}
        >
          We've sent a secure sign-in link to
        </p>
      </div>

      {/* Email Display */}
      <div 
        className="rounded-[12px] py-4 px-5 mb-6"
        style={{
          background: "#fbfbfb",
          border: "1px solid rgba(0,0,0,0.10)",
        }}
      >
        <p 
          className="text-[15px] font-medium text-center break-all"
          style={{ color: "rgba(0,0,0,0.92)" }}
        >
          {email}
        </p>
      </div>

      {/* Expiration Notice */}
      <p 
        className="text-[14px] text-center"
        style={{ color: "rgba(0,0,0,0.62)" }}
      >
        This link expires shortly and can only be used once.
      </p>

      {/* Secondary Actions */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-[14px] transition-colors duration-150 disabled:opacity-45"
          style={{ color: "rgba(0,0,0,0.62)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(0,0,0,0.92)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(0,0,0,0.62)"; }}
        >
          {isResending ? "Sending..." : "Resend sign-in link"}
        </button>
        <Link 
          to="/auth/sign-in"
          className="text-[14px] transition-colors duration-150"
          style={{ color: "rgba(0,0,0,0.62)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(0,0,0,0.92)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(0,0,0,0.62)"; }}
        >
          Use a different email
        </Link>
      </div>
    </AuthLayout>
  );
}
