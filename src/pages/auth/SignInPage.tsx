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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Auth Surface */}
      <div 
        className="w-full max-w-[440px] bg-white border border-[#E4E4E7] px-10 py-12 sm:px-12 sm:py-14"
        style={{ 
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#09090B] tracking-[-0.01em] leading-tight">
            Tribes Portal
          </h1>
          <p className="mt-3 text-[14px] text-[#71717A] leading-relaxed">
            Secure access for approved accounts
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
              className="h-11 px-3.5 text-[15px] text-[#09090B] bg-white border-[#D4D4D8] rounded-[6px] placeholder:text-[#A1A1AA] focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] transition-colors"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-[#09090B] hover:bg-[#18181B] text-white text-[14px] font-medium rounded-[6px] transition-colors"
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? "Requesting access..." : "Request access"}
          </Button>
        </form>

        {/* Institutional Notice */}
        <p className="mt-8 text-center text-[12px] text-[#A1A1AA] leading-relaxed">
          Access is restricted to approved accounts only.
        </p>
      </div>
    </div>
  );
}
