import { useState } from "react";
import { ExternalLink, AlertCircle } from "lucide-react";
import { AppButton } from "@/components/app-ui";

/**
 * HELP SETTINGS PAGE — INSTITUTIONAL DESIGN
 * 
 * Text toggles instead of iOS switches
 * Checkboxes for boolean settings
 * Inline errors (not toasts)
 * All icons: strokeWidth={1.5}
 */

export default function HelpSettingsPage() {
  const [publicHelpEnabled, setPublicHelpEnabled] = useState(true);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const [trackViews, setTrackViews] = useState(true);
  const [trackSearches, setTrackSearches] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
          HELP WORKSTATION
        </p>
        <h1 className="text-[20px] font-medium text-foreground mb-1">Settings</h1>
        <p className="text-[13px] text-muted-foreground">Configure Help Center behavior</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Public Help Center */}
        <div className="bg-card border border-border rounded p-5">
          <h3 className="text-[14px] font-medium text-foreground mb-4">Public Help Center</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between py-2.5 border-b border-border/30">
              <div>
                <p className="text-[13px] text-foreground">Enable public Help Center</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Make published articles accessible at /help</p>
              </div>
              <input 
                type="checkbox" 
                checked={publicHelpEnabled} 
                onChange={(e) => setPublicHelpEnabled(e.target.checked)} 
                className="h-4 w-4 rounded border-ring bg-transparent checked:bg-white checked:border-white focus:ring-0 focus:ring-offset-0"
              />
            </label>
            
            <label className="flex items-center justify-between py-2.5 border-b border-border/30">
              <div>
                <p className="text-[13px] text-foreground">Enable search</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Allow visitors to search articles</p>
              </div>
              <input 
                type="checkbox" 
                checked={searchEnabled} 
                onChange={(e) => setSearchEnabled(e.target.checked)} 
                className="h-4 w-4 rounded border-ring bg-transparent checked:bg-white checked:border-white focus:ring-0 focus:ring-offset-0"
              />
            </label>
            
            <label className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[13px] text-foreground">Enable article feedback</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Show "Was this helpful?" on articles</p>
              </div>
              <input 
                type="checkbox" 
                checked={feedbackEnabled} 
                onChange={(e) => setFeedbackEnabled(e.target.checked)} 
                className="h-4 w-4 rounded border-ring bg-transparent checked:bg-white checked:border-white focus:ring-0 focus:ring-offset-0"
              />
            </label>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <a 
              href="/help" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              View Public Help Center
              <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-card border border-border rounded p-5">
          <h3 className="text-[14px] font-medium text-foreground mb-4">Analytics</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between py-2.5 border-b border-border/30">
              <div>
                <p className="text-[13px] text-foreground">Track article views</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Record when articles are viewed</p>
              </div>
              <input 
                type="checkbox" 
                checked={trackViews} 
                onChange={(e) => setTrackViews(e.target.checked)} 
                className="h-4 w-4 rounded border-ring bg-transparent checked:bg-white checked:border-white focus:ring-0 focus:ring-offset-0"
              />
            </label>
            
            <label className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[13px] text-foreground">Track search queries</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Log search terms for analytics</p>
              </div>
              <input 
                type="checkbox" 
                checked={trackSearches} 
                onChange={(e) => setTrackSearches(e.target.checked)} 
                className="h-4 w-4 rounded border-ring bg-transparent checked:bg-white checked:border-white focus:ring-0 focus:ring-offset-0"
              />
            </label>
          </div>
          
          <div className="mt-4 p-3 bg-background border border-border/50 rounded">
            <p className="text-[11px] text-muted-foreground">
              Analytics data helps improve Help content by showing popular topics and search gaps.
            </p>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-card border border-border rounded p-5">
          <h3 className="text-[14px] font-medium text-foreground mb-4">Permissions</h3>
          
          <div className="space-y-3">
            <p className="text-[12px] text-muted-foreground">
              Help Workstation access is managed via platform capabilities. Users with the{" "}
              <code className="px-1.5 py-0.5 bg-background border border-border rounded text-[11px] font-mono">
                can_manage_help
              </code>{" "}
              capability or Platform Administrators can access this workstation.
            </p>
            
            <div className="mt-4 p-3 bg-background border border-border/50 rounded">
              <p className="text-[12px] text-foreground font-medium mb-1">Role-based access</p>
              <p className="text-[11px] text-muted-foreground">
                Contact a Platform Administrator to grant or revoke Help access for users.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <AppButton intent="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : saved ? "Saved" : "Save Settings"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
