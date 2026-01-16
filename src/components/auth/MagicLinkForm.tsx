import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface MagicLinkFormProps {
  buttonLabel?: string;
  autoFocus?: boolean;
  /** Optional callback after successful submit - if not provided, navigates to check-email state */
  onSuccess?: (email: string) => void;
}

/**
 * MagicLinkForm - Standalone magic link form
 * Used by LinkExpiredPage and other recovery flows
 * 
 * LOCKED DESIGN TOKENS:
 * - Field label: 14px, font-medium, color #111
 * - Input: height 48px, radius 10px, px-4, border #D1D1D6, focus ring black/20
 * - Primary button: height 48px, radius 10px, bg #111111, text white, font-medium, 15px, px-6, centered
 */
export function MagicLinkForm({ 
  buttonLabel = "Continue",
  autoFocus = true,
  onSuccess
}: MagicLinkFormProps) {
  const navigate = useNavigate();
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim());
    setIsSubmitting(false);

    if (error) {
      console.error("Sign-in error:", error);
    }
    
    if (onSuccess) {
      onSuccess(email.trim());
    } else {
      navigate("/auth/sign-in?sent=1&email=" + encodeURIComponent(email.trim()));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label 
          htmlFor="email" 
          className="text-[14px] font-medium block text-[#111]"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus={autoFocus}
          autoComplete="email"
          className="w-full h-[48px] px-4 text-[15px] rounded-[10px] bg-white border border-[#D1D1D6] text-[#111] placeholder:text-[#9CA3AF] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-black/20 focus:border-transparent"
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting || !email.trim()}
        className="w-full h-[48px] flex items-center justify-center px-6 rounded-[10px] bg-[#111111] text-white text-[15px] font-medium transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7] disabled:bg-[#a3a3a3] disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : buttonLabel}
      </button>
    </form>
  );
}
