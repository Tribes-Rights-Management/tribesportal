import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CoverStepProps {
  onStart: () => void;
  isLoading?: boolean;
}

export function CoverStep({ onStart, isLoading }: CoverStepProps) {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-semibold mb-4">License Request</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Complete this form to request a license for your music use. 
        Your progress is saved automatically.
      </p>
      <Button onClick={onStart} disabled={isLoading} size="lg">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Starting...
          </>
        ) : (
          "Get Started"
        )}
      </Button>
    </div>
  );
}
