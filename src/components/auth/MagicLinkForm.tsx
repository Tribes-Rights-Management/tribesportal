import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface MagicLinkFormProps {
  buttonLabel?: string;
  autoFocus?: boolean;
}

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
      <div className="space-y-1.5">
        <Label 
          htmlFor="email" 
          className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block"
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
          autoFocus={autoFocus}
          autoComplete="email"
          className="h-11 px-3.5 text-[15px] bg-white dark:bg-[#0f1012] border-black/15 dark:border-white/15 rounded-xl placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/50 transition-colors"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || !email.trim()}
        className="w-full h-11 text-[15px] font-medium rounded-xl bg-[#111] text-white hover:bg-[#222] dark:bg-[#f5f5f5] dark:text-[#111] dark:hover:bg-[#e5e5e5] disabled:opacity-40 transition-colors"
      >
        {isSubmitting ? "Sending..." : buttonLabel}
      </Button>
    </form>
  );
}
