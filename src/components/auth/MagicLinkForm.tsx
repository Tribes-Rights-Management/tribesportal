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
          autoFocus={autoFocus}
          autoComplete="email"
          className="h-12 px-4 text-[15px] text-[#0A0A0A] bg-white border-[#D4D4D8] rounded-[6px] placeholder:text-[#A1A1AA] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] transition-colors"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 bg-[#0A0A0A] hover:bg-[#171717] text-white text-[15px] font-medium rounded-[6px] transition-colors"
        disabled={isSubmitting || !email.trim()}
      >
        {isSubmitting ? "Sending..." : buttonLabel}
      </Button>
    </form>
  );
}