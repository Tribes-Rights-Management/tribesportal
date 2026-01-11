import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignInHelpDialog } from "@/components/auth/SignInHelpDialog";
import { AuthLayout } from "@/layouts/AuthLayout";

export default function SignInPage() {
  const { user, profile, loading, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  const handleResendLink = async () => {
    return signInWithMagicLink(email.trim());
  };

  // If already authenticated with valid profile, redirect to appropriate dashboard
  if (!loading && user && profile) {
    if (profile.status !== "active") {
      return <Navigate to="/auth/error" replace />;
    }
    
    // Platform admins go to admin, everyone else goes to app
    if (profile.platform_role === "platform_admin") {
      return <Navigate to="/admin" replace />;
    }
    
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim());
    setIsSubmitting(false);

    if (error) {
      console.error("Sign-in error:", error);
    }
    
    navigate("/auth/check-email", { state: { email: email.trim() } });
  };

  if (loading) {
    return (
      <AuthLayout>
        <p className="text-[#71717A] text-[13px] tracking-wide text-center">Verifying access...</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-[22px] font-medium text-[#0A0A0A] tracking-[-0.01em] leading-tight">
          Sign in to Tribes
        </h1>
        <p className="mt-2 text-[13px] text-[#71717A]">
          Secure access via email sign-in link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label 
            htmlFor="email" 
            className="text-[12px] font-medium text-[#52525B] block"
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
            className="h-10 px-3 text-[14px] text-[#0A0A0A] bg-white border-[#E4E4E7] rounded-[5px] placeholder:text-[#A1A1AA] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] transition-colors"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-10 bg-[#0A0A0A] hover:bg-[#171717] text-white text-[13px] font-medium rounded-[5px] transition-colors"
          disabled={isSubmitting || !email.trim()}
        >
          {isSubmitting ? "Sending..." : "Continue"}
        </Button>
      </form>

      {/* Institutional Notice */}
      <p className="mt-6 text-center text-[12px] text-[#A1A1AA]">
        Access is restricted to approved accounts.
      </p>

      {/* Help Link */}
      <p className="mt-3 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-[12px] text-[#71717A] hover:text-[#0A0A0A] transition-colors"
        >
          Trouble signing in?
        </button>
      </p>

      <SignInHelpDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
        email={email}
        onResendLink={handleResendLink}
      />
    </AuthLayout>
  );
}
