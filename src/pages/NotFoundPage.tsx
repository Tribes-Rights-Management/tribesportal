import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2">
          <CardTitle className="text-6xl font-bold text-muted-foreground">404</CardTitle>
          <CardDescription className="text-lg">
            Page not found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/auth/sign-in">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
