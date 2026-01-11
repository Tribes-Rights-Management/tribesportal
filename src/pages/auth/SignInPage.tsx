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
        <p className="text-muted-foreground text-base text-center">Verifying access...</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[28px] font-semibold text-foreground tracking-[-0.02em] leading-[1.2]">
          Sign in to Tribes
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Secure access via email sign-in link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label 
            htmlFor="email" 
            className="text-[14px] font-medium text-foreground block"
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
            className="h-[48px] px-4 text-[15px] text-foreground bg-background border-input rounded-xl placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-[48px] text-[15px] font-medium rounded-xl"
          disabled={isSubmitting || !email.trim()}
        >
          {isSubmitting ? "Sending..." : "Continue"}
        </Button>
      </form>

      {/* Institutional Notice */}
      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Access is restricted to approved accounts.
      </p>

      {/* Help Link */}
      <p className="mt-3 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-200"
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
