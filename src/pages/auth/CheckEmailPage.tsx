import { useLocation, Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";

export default function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email;

  // If no email in state, redirect to sign-in
  if (!email) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
          <CardDescription className="text-base">
            We've sent a sign-in link to
          </CardDescription>
          <p className="font-medium text-foreground">{email}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the link in your email to sign in to your account. 
            The link will expire in 1 hour.
          </p>
          <div className="pt-4">
            <Button variant="ghost" asChild>
              <Link to="/auth/sign-in">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
