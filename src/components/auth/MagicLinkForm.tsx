import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface MagicLinkFormProps {
  buttonLabel?: string;
  autoFocus?: boolean;
}

/**
 * MagicLinkForm - Premium auth form component
 * Light mode only, Apple-grade styling
 */
export function MagicLinkForm({ 
  buttonLabel = "Continue",
  autoFocus = true 
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
    
    navigate("/auth/check-email", { state: { email: email.trim() } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label 
          htmlFor="email" 
          className="text-[14px] font-medium block text-black/85"
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
          className="w-full h-11 px-3.5 text-[15px] rounded-[10px] bg-white border border-black/10 text-black/90 placeholder:text-black/35 outline-none transition-shadow duration-150 focus:ring-2 focus:ring-black/15"
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting || !email.trim()}
        className="w-full h-11 text-[15px] font-medium rounded-[10px] bg-[#111] text-white transition-all duration-150 hover:bg-[#222] disabled:opacity-40 disabled:bg-neutral-400"
      >
        {isSubmitting ? "Sending..." : buttonLabel}
      </button>
    </form>
  );
}
