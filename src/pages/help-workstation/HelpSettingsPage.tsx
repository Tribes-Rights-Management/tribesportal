import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

/**
 * HELP SETTINGS PAGE — INSTITUTIONAL DESIGN
 * 
 * Configuration for Help Center:
 * - NO decorative icons (globe, lock, chart)
 * - Text toggles instead of iOS switches
 * - Sharp corners (rounded-md)
 * - Dense layout
 */

export default function HelpSettingsPage() {
  // Settings state (would be persisted in real implementation)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [publicHelpEnabled, setPublicHelpEnabled] = useState(true);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [trackViews, setTrackViews] = useState(true);
  const [trackSearches, setTrackSearches] = useState(true);

  const handleSave = () => {
    toast({ title: "Settings saved" });
  };

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-5">
        <p 
          className="text-[10px] uppercase tracking-wider font-medium mb-1"
          style={{ color: '#6B6B6B' }}
        >
          Help Workstation
        </p>
        <h1 
          className="text-[20px] font-medium leading-tight"
          style={{ color: 'var(--platform-text)' }}
        >
          Settings
        </h1>
        <p 
          className="text-[13px] mt-1"
          style={{ color: '#AAAAAA' }}
        >
          Configure Help Center behavior
        </p>
      </div>

      <div className="space-y-5">
        {/* Public Help Center */}
        <div 
          className="rounded-md p-5"
          style={{ 
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030'
          }}
        >
          <h3 
            className="text-[14px] font-medium mb-4"
            style={{ color: 'white' }}
          >
            Public Help Center
          </h3>
          
          <div className="space-y-0">
            {/* Enable public Help Center */}
            <SettingToggle
              label="Enable public Help Center"
              description="Make published articles accessible at /help"
              enabled={publicHelpEnabled}
              onToggle={() => setPublicHelpEnabled(!publicHelpEnabled)}
            />
            
            {/* Enable search */}
            <SettingToggle
              label="Enable search"
              description="Allow visitors to search articles"
              enabled={searchEnabled}
              onToggle={() => setSearchEnabled(!searchEnabled)}
            />
            
            {/* Enable feedback */}
            <SettingToggle
              label="Enable article feedback"
              description="Show 'Was this helpful?' on articles"
              enabled={feedbackEnabled}
              onToggle={() => setFeedbackEnabled(!feedbackEnabled)}
              isLast
            />
          </div>

          {publicHelpEnabled && (
            <div 
              className="mt-4 pt-4"
              style={{ borderTop: '1px solid #303030' }}
            >
              <button
                onClick={() => window.open("/help", "_blank")}
                className="text-[12px] flex items-center gap-1.5 transition-colors"
                style={{ color: '#AAAAAA' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#AAAAAA'}
              >
                View Public Help Center
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        {/* Analytics */}
        <div 
          className="rounded-md p-5"
          style={{ 
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030'
          }}
        >
          <h3 
            className="text-[14px] font-medium mb-4"
            style={{ color: 'white' }}
          >
            Analytics
          </h3>
          
          <div className="space-y-0">
            <SettingToggle
              label="Track article views"
              description="Record when articles are viewed"
              enabled={trackViews}
              onToggle={() => setTrackViews(!trackViews)}
            />
            
            <SettingToggle
              label="Track search queries"
              description="Log search terms for analytics"
              enabled={trackSearches}
              onToggle={() => setTrackSearches(!trackSearches)}
              isLast
            />
          </div>
          
          <p 
            className="text-[11px] mt-4"
            style={{ color: '#6B6B6B' }}
          >
            Analytics data helps improve Help content by showing popular topics and search gaps.
          </p>
        </div>

        {/* Permissions */}
        <div 
          className="rounded-md p-5"
          style={{ 
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030'
          }}
        >
          <h3 
            className="text-[14px] font-medium mb-4"
            style={{ color: 'white' }}
          >
            Permissions
          </h3>
          
          <p 
            className="text-[13px] mb-3"
            style={{ color: '#AAAAAA' }}
          >
            Help Workstation access is managed via platform capabilities. 
            Users with the <code 
              className="text-[11px] px-1 py-0.5 rounded"
              style={{ backgroundColor: '#252525' }}
            >can_manage_help</code> capability 
            or Platform Administrators can access this workstation.
          </p>
          
          <div 
            className="p-3 rounded-md"
            style={{
              backgroundColor: '#141414',
              border: '1px solid #303030',
            }}
          >
            <p 
              className="text-[13px] font-medium"
              style={{ color: '#AAAAAA' }}
            >
              Role-based access
            </p>
            <p 
              className="text-[11px] mt-0.5"
              style={{ color: '#6B6B6B' }}
            >
              Contact a Platform Administrator to grant or revoke Help access for users.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button 
            variant="default"
            size="sm"
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

// Text-based toggle instead of iOS switch
function SettingToggle({ 
  label, 
  description, 
  enabled, 
  onToggle,
  isLast = false 
}: { 
  label: string; 
  description: string; 
  enabled: boolean; 
  onToggle: () => void;
  isLast?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between py-3 w-full text-left transition-colors"
      style={{ 
        borderBottom: isLast ? 'none' : '1px solid rgba(48,48,48,0.5)',
      }}
    >
      <div>
        <p 
          className="text-[13px] font-medium"
          style={{ color: 'white' }}
        >
          {label}
        </p>
        <p 
          className="text-[11px] mt-0.5"
          style={{ color: '#8F8F8F' }}
        >
          {description}
        </p>
      </div>
      <span 
        className="text-[12px] transition-colors"
        style={{ color: enabled ? '#AAAAAA' : '#6B6B6B' }}
      >
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
    </button>
  );
}
