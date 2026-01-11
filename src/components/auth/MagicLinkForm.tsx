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
          autoFocus={autoFocus}
          autoComplete="email"
          className="h-[52px] px-4 text-base text-foreground bg-white border-[rgba(0,0,0,0.18)] rounded-[14px] placeholder:text-[rgba(11,15,20,0.35)] focus:border-foreground focus:ring-2 focus:ring-foreground/12 transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || !email.trim()}
      >
        {isSubmitting ? "Sending..." : buttonLabel}
      </Button>
    </form>
  );
}
