import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout, AuthHeader, AuthFooter } from "@/components/auth/AuthLayout";

export default function LinkExpiredPage() {
  const navigate = useNavigate();
  const { signInWithMagicLink } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim());
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Unable to send",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } else {
      navigate("/auth/check-email", { state: { email: email.trim() } });
    }
  };

  return (
    <AuthLayout
      footer={<AuthFooter>Access is restricted to approved accounts.</AuthFooter>}
    >
      <AuthHeader 
        title="Link Expired"
        subtitle="Sign-in links can only be used once and expire after a short time."
      />

      {/* Request new link form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label 
            htmlFor="email" 
            className="text-[13px] font-medium text-black/70 block"
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
            className="h-12 px-4 text-[15px] text-foreground bg-white border-black/15 rounded-lg placeholder:text-black/40 focus:border-black/40 focus:ring-1 focus:ring-black/20 transition-colors"
          />
        </div>

        <button 
          type="submit" 
          className="w-full h-12 bg-[#101010] hover:bg-black/90 hover:shadow-md text-white text-[15px] font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
          disabled={isSubmitting || !email.trim()}
        >
          {isSubmitting ? "Sending..." : "Request a new link"}
        </button>
      </form>

      {/* Secondary link */}
      <p className="mt-8 text-center">
        <Link 
          to="/auth/sign-in"
          className="text-[13px] text-black/60 hover:text-black transition-colors"
        >
          Return to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
