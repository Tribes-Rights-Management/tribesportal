import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function SignInPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signInWithMagicLink } = useAuth();

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
      // Still navigate to check-email, but could show error
      console.error("Magic link error:", error);
    }
    
    navigate("/auth/check-email", { state: { email: email.trim() } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold">Tribes Portal</CardTitle>
          <CardDescription>
            Enter your email to receive a sign-in link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !email.trim()}
            >
              <Mail className="mr-2 h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send sign-in link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
