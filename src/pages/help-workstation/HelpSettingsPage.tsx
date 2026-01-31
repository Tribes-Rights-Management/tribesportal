import { useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  AppButton,
  AppPageHeader,
  AppPageContainer,
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardDescription,
  AppCardBody,
  AppSection,
  AppAlert,
} from "@/components/app-ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/**
 * HELP SETTINGS PAGE — DESIGN SYSTEM COMPLIANT
 * 
 * Uses canonical app-ui components for consistency.
 */

interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SettingToggle({ id, label, description, checked, onCheckedChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <Label htmlFor={id} className="text-[13px] font-medium text-foreground cursor-pointer">
          {label}
        </Label>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

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
    <AppPageContainer maxWidth="lg">
      {/* Header */}
      <AppPageHeader
        backLink={{ to: "/help", label: "Overview" }}
        eyebrow="Help Workstation"
        title="Settings"
        description="Configure Help Center behavior"
      />

      {/* Public Help Center */}
      <AppSection spacing="md">
        <AppCard>
          <AppCardHeader>
            <AppCardTitle>Public Help Center</AppCardTitle>
            <AppCardDescription>Control public access and features</AppCardDescription>
          </AppCardHeader>
          <AppCardBody>
            <SettingToggle
              id="public-help"
              label="Enable public Help Center"
              description="Make published articles accessible at /help"
              checked={publicHelpEnabled}
              onCheckedChange={setPublicHelpEnabled}
            />
            <SettingToggle
              id="search"
              label="Enable search"
              description="Allow visitors to search articles"
              checked={searchEnabled}
              onCheckedChange={setSearchEnabled}
            />
            <SettingToggle
              id="feedback"
              label="Enable article feedback"
              description='Show "Was this helpful?" on articles'
              checked={feedbackEnabled}
              onCheckedChange={setFeedbackEnabled}
            />
            
            <div className="mt-4 pt-4 border-t border-border/40">
              <a 
                href="/help" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                View Public Help Center
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </a>
            </div>
          </AppCardBody>
        </AppCard>
      </AppSection>

      {/* Analytics */}
      <AppSection spacing="md">
        <AppCard>
          <AppCardHeader>
            <AppCardTitle>Analytics</AppCardTitle>
            <AppCardDescription>Data collection preferences</AppCardDescription>
          </AppCardHeader>
          <AppCardBody>
            <SettingToggle
              id="track-views"
              label="Track article views"
              description="Record when articles are viewed"
              checked={trackViews}
              onCheckedChange={setTrackViews}
            />
            <SettingToggle
              id="track-searches"
              label="Track search queries"
              description="Log search terms for analytics"
              checked={trackSearches}
              onCheckedChange={setTrackSearches}
            />
            
            <div className="mt-4">
              <AppAlert
                variant="info"
                message="Analytics data helps improve Help content by showing popular topics and search gaps."
              />
            </div>
          </AppCardBody>
        </AppCard>
      </AppSection>

      {/* Permissions */}
      <AppSection spacing="md">
        <AppCard>
          <AppCardHeader>
            <AppCardTitle>Permissions</AppCardTitle>
            <AppCardDescription>Access control for Help Workstation</AppCardDescription>
          </AppCardHeader>
          <AppCardBody>
            <p className="text-[12px] text-muted-foreground">
              Help Workstation access is managed via platform capabilities. Users with the{" "}
              <code className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px] font-mono">
                can_manage_help
              </code>{" "}
              capability or Platform Administrators can access this workstation.
            </p>
            
            <div className="mt-4">
              <AppAlert
                variant="info"
                message="Contact a Platform Administrator to grant or revoke Help access for users."
              />
            </div>
          </AppCardBody>
        </AppCard>
      </AppSection>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <AppButton intent="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved" : "Save Settings"}
        </AppButton>
      </div>
    </AppPageContainer>
  );
}
