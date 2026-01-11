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
          autoFocus={autoFocus}
          autoComplete="email"
          className="h-11 px-3.5 text-[15px] bg-white dark:bg-white/5 border-zinc-300 dark:border-white/15 rounded-xl placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-white/15 focus-visible:border-zinc-400 dark:focus-visible:border-white/25 transition-colors"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || !email.trim()}
        className="w-full h-11 text-[15px] font-medium rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 disabled:opacity-40"
      >
        {isSubmitting ? "Sending..." : buttonLabel}
      </Button>
    </form>
  );
}
