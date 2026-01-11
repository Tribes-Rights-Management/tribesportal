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
      {/* Header - Marketing site alignment */}
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-bold text-foreground tracking-[-0.02em] leading-[1.125]">
          Sign in to Tribes
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Secure access via email sign-in link
        </p>
      </div>

      {/* Form - Marketing site alignment */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label 
            htmlFor="email" 
            className="text-[14px] font-semibold text-[rgba(11,15,20,0.80)] block"
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
            className="h-[52px] px-4 text-base text-foreground bg-white border-[rgba(0,0,0,0.18)] rounded-[14px] placeholder:text-[rgba(11,15,20,0.35)] focus:border-foreground focus:ring-2 focus:ring-foreground/12 transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || !email.trim()}
        >
          {isSubmitting ? "Sending..." : "Continue"}
        </Button>
      </form>

      {/* Institutional Notice */}
      <p className="mt-8 text-center text-[14px] text-muted-foreground">
        Access is restricted to approved accounts.
      </p>

      {/* Help Link */}
      <p className="mt-4 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
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
