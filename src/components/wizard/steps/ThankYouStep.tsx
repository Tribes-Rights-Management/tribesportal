import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function ThankYouStep() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      
      <h1 className="text-2xl font-semibold mb-4">Request Submitted</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Thank you for your license request. Our team will review your submission 
        and contact you with next steps.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline">
          <Link to="/portal/licenses">View My Licenses</Link>
        </Button>
        <Button asChild>
          <Link to="/portal">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
