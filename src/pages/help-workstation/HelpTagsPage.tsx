import { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * HELP TAGS PAGE — INSTITUTIONAL DESIGN
 * Tags feature placeholder - requires database schema update to add tags column.
 */

export default function HelpTagsPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
          HELP WORKSTATION
        </p>
        <h1 className="text-[20px] font-medium text-foreground mb-1">Tags</h1>
        <p className="text-[13px] text-muted-foreground">Manage article tags</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-foreground">{error}</p>
            <button onClick={() => setError(null)} className="text-[11px] text-destructive hover:text-destructive/80 underline mt-1 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded p-8 text-center">
        <p className="text-[13px] text-muted-foreground">
          Tags are managed through the article editor. This page will show tag analytics when the feature is enabled.
        </p>
      </div>
    </div>
  );
}
