import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";

export default function AgreementHandoffPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (id) fetchRequest(id);
  }, [id]);

  async function fetchRequest(requestId: string) {
    try {
      const { data, error } = await supabase
        .from("license_packages")
        .select("status, signing_url")
        .eq("id", requestId)
        .single();

      if (error) throw error;

      // Only allow access if status is awaiting_signature or awaiting_payment
      if (data.status !== "awaiting_signature" && data.status !== "awaiting_payment") {
        navigate(`/portal/request/${requestId}`, { replace: true });
        return;
      }

      setSigningUrl(data.signing_url);
    } catch (error) {
      console.error("Error fetching request:", error);
      toast({ title: "Error", description: "Failed to load agreement", variant: "destructive" });
      navigate("/portal");
    } finally {
      setIsLoading(false);
    }
  }

  function handleContinue() {
    if (!signingUrl) {
      toast({ title: "Not available", description: "The agreement link is not ready yet.", variant: "destructive" });
      return;
    }
    
    setIsNavigating(true);
    
    // Brief delay to prevent double-clicks
    setTimeout(() => {
      window.location.href = signingUrl;
    }, 300);
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
            disabled={isNavigating || !signingUrl}
            className="h-10 px-6 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
