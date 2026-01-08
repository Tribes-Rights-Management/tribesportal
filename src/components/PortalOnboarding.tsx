import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PortalOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("portal_onboarding_seen");
    if (!hasSeenOnboarding) {
      setOpen(true);
    }
  }, []);

  function handleClose() {
    localStorage.setItem("portal_onboarding_seen", "true");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to the Portal</DialogTitle>
          <DialogDescription>
            Your hub for managing license requests.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Submit Requests</h4>
            <p className="text-sm text-muted-foreground">
              Create and submit license requests for review.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Track Progress</h4>
            <p className="text-sm text-muted-foreground">
              Monitor the status of your submissions in real-time.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Manage Documents</h4>
            <p className="text-sm text-muted-foreground">
              Access and download your license agreements.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleClose}>Get Started</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
