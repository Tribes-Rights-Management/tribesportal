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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Sign in to Tribes
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Secure access via email sign-in link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label 
            htmlFor="email" 
            className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 block"
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
            className="h-11 px-3.5 text-[15px] bg-white dark:bg-white/5 border-zinc-300 dark:border-white/15 rounded-xl placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-white/15 focus-visible:border-zinc-400 dark:focus-visible:border-white/25 transition-colors"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting || !email.trim()}
          className="w-full h-11 text-[15px] font-medium rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 disabled:opacity-40"
        >
          {isSubmitting ? "Sending..." : "Continue"}
        </Button>
      </form>

      {/* Institutional Notice */}
      <p className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Access is restricted to approved accounts.
      </p>

      {/* Help Link */}
      <p className="mt-2 text-center">
        <button 
          type="button"
          onClick={() => setHelpDialogOpen(true)}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:underline transition-colors"
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
