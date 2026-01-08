import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LicenseRequest } from "@/types";

interface LicensePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LicenseRequest | null;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function LicensePreviewModal({
  open,
  onOpenChange,
  request,
  onGenerate,
  isGenerating,
}: LicensePreviewModalProps) {
  if (!request) return null;

  const trackTitle = request.track_title || request.song_title || "Untitled";
  const licenseeName = request.licensee_legal_name || 
    [request.first_name, request.last_name].filter(Boolean).join(" ") || 
    "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>License Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <h2 className="text-xl font-semibold mb-2">Music License Agreement</h2>
            <p className="text-sm text-muted-foreground">
              License ID: {request.license_id || "Pending"}
            </p>
          </div>

          {/* Parties */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Licensee</h3>
              <p className="text-sm">{licenseeName}</p>
              {request.organization && (
                <p className="text-sm text-muted-foreground">{request.organization}</p>
              )}
            </div>
          </div>

          {/* Track Info */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium">Licensed Work</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Track Title:</span>
                <p>{trackTitle}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Artist:</span>
                <p>{request.recording_artist || request.track_artist || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">ISRC:</span>
                <p>{request.track_isrc || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Runtime:</span>
                <p>{request.runtime || "—"}</p>
              </div>
            </div>
          </div>

          {/* License Types */}
          {request.selected_license_types && request.selected_license_types.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium">License Types</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {request.selected_license_types.map((type, i) => (
                  <li key={i}>{type}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {onGenerate && (
            <div className="flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={onGenerate} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate License"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
