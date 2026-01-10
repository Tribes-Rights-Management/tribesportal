import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignInHelpDialog } from "@/components/auth/SignInHelpDialog";
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
    
    switch (profile.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "client":
        return <Navigate to="/dashboard" replace />;
      case "licensing":
        return <Navigate to="/licensing" replace />;
      default:
        return <Navigate to="/auth/error" replace />;
    }
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#71717A] text-[14px] tracking-wide">Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0A0A0A] tracking-[-0.02em] leading-tight">
            Sign in to Tribes
          </h1>
          <p className="mt-3 text-[15px] text-[#6B6B6B] leading-relaxed">
            Secure access via email sign-in link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label 
              htmlFor="email" 
              className="text-[13px] font-medium text-[#3F3F46] block"
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
              className="h-12 px-4 text-[15px] text-[#0A0A0A] bg-white border-[#D4D4D8] rounded-[6px] placeholder:text-[#A1A1AA] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] transition-colors"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-[#0A0A0A] hover:bg-[#171717] text-white text-[15px] font-medium rounded-[6px] transition-colors"
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? "Sending..." : "Continue"}
          </Button>
        </form>

        {/* Institutional Notice */}
        <p className="mt-8 text-center text-[13px] text-[#A1A1AA] leading-relaxed">
          Access is restricted to approved accounts.
        </p>

        {/* Help Link */}
        <p className="mt-4 text-center">
          <button 
            type="button"
            onClick={() => setHelpDialogOpen(true)}
            className="text-[13px] text-[#71717A] hover:text-[#0A0A0A] transition-colors"
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
      </div>
    </div>
  );
}
