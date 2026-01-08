import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function PortalOnboardingBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem("portal_onboarding_dismissed");
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem("portal_onboarding_dismissed", "true");
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <h3 className="text-sm font-medium mb-1">Welcome to your portal</h3>
      <p className="text-sm text-muted-foreground">
        Submit license requests and track their progress here.
      </p>
    </div>
  );
}
