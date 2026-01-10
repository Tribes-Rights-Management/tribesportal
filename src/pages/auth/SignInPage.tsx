import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const { user, profile, loading, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      console.error("Magic link error:", error);
    }
    
    navigate("/auth/check-email", { state: { email: email.trim() } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#6B6B6B] text-sm tracking-wide">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Auth Card */}
      <div 
        className="w-full max-w-[440px] bg-white border border-[#E5E5E5] px-10 py-12 sm:px-12 sm:py-14"
        style={{ 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.01em] leading-tight">
            Sign in to Tribes
          </h1>
          <p className="mt-3 text-[14px] text-[#6B6B6B] leading-relaxed">
            Secure access via email sign-in link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label 
              htmlFor="email" 
              className="text-[13px] font-medium text-[#333333] block"
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
              className="h-11 px-3.5 text-[15px] bg-white border-[#D4D4D4] rounded-[6px] placeholder:text-[#A0A0A0] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-colors"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-[#111111] hover:bg-[#000000] text-white text-[14px] font-medium rounded-[6px] transition-colors"
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? "Sending..." : "Send sign-in link"}
          </Button>
        </form>

        {/* Institutional notice */}
        <p className="mt-8 text-center text-[12px] text-[#888888] leading-relaxed">
          Access is restricted to approved accounts.
        </p>
      </div>
    </div>
  );
}
