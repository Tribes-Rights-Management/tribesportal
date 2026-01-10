import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

export default function LinkExpiredPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const supportEmail = "admin@tribesassets.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback - do nothing
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Import supabase client dynamically to send magic link
    const { supabase } = await import("@/integrations/supabase/client");
    
    await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsSubmitting(false);
    navigate("/auth/check-email", { state: { email: email.trim() } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0A0A0A] tracking-[-0.02em] leading-tight">
            This sign-in link has expired
          </h1>
          <p className="mt-3 text-[15px] text-[#6B6B6B] leading-relaxed">
            Sign-in links expire quickly and can only be used once.
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

          <button 
            type="submit" 
            className="w-full h-12 bg-[#0A0A0A] hover:bg-[#171717] text-white text-[15px] font-medium rounded-[6px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? "Sending..." : "Request a new sign-in link"}
          </button>
        </form>

        {/* Support section */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="text-[12px] text-black/40">Support</span>
          <span className="text-[13px] text-black/55">{supportEmail}</span>
          <button
            onClick={handleCopyEmail}
            className="flex items-center justify-center p-0.5 transition-colors hover:opacity-70 focus:outline-none cursor-pointer"
            aria-label="Copy email address"
            type="button"
          >
            {copied ? (
              <Check className="h-[14px] w-[14px] text-emerald-600" strokeWidth={1.5} />
            ) : (
              <Copy className="h-[14px] w-[14px] text-[#9CA3AF] hover:text-[#6B7280]" strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Institutional Notice */}
        <p className="mt-6 text-center text-[13px] text-[#A1A1AA] leading-relaxed">
          Access is restricted to approved accounts.
        </p>

        {/* Back Link */}
        <p className="mt-4 text-center">
          <Link 
            to="/auth/sign-in"
            className="text-[13px] text-[#71717A] hover:text-[#0A0A0A] transition-colors"
          >
            Return to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}