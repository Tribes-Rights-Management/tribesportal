import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";

export default function AgreementHandoffPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchRequest(id);
  }, [id]);

  async function fetchRequest(requestId: string) {
    try {
      const { data, error } = await supabase
        .from("license_packages")
        .select("status")
        .eq("id", requestId)
        .single();

      if (error) throw error;

      // Only allow access if status is awaiting_signature or awaiting_payment
      if (data.status !== "awaiting_signature" && data.status !== "awaiting_payment") {
        navigate(`/portal/request/${requestId}`, { replace: true });
        return;
      }
    } catch (error) {
      console.error("Error fetching request:", error);
      toast({ title: "Error", description: "Failed to load agreement", variant: "destructive" });
      navigate("/portal");
    } finally {
      setIsLoading(false);
    }
  }

  function handleContinue() {
    toast({ title: "Coming soon", description: "Agreement signing will be available soon." });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-2">Review your agreement</h1>
          <p className="text-sm text-muted-foreground mb-8">
            You'll review, sign, and complete payment in the next step.
          </p>

          <button
            onClick={handleContinue}
            className="h-10 px-6 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Review, sign, and pay
          </button>

          <p className="text-xs text-muted-foreground mt-6">
            You'll complete this securely using our document provider.
          </p>
        </div>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
