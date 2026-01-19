import { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { 
  AppCard, 
  AppCardHeader, 
  AppCardTitle, 
  AppCardBody,
  AppSectionHeader,
  AppButton,
} from "@/components/app-ui";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ExternalLink, Globe, Users, BarChart3, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * HELP SETTINGS PAGE — HELP WORKSTATION
 * 
 * Configuration for Help Center:
 * - Public routing settings
 * - Analytics tracking toggle
 * - Permission management
 */

export default function HelpSettingsPage() {
  // Settings state (would be persisted in real implementation)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [publicHelpEnabled, setPublicHelpEnabled] = useState(true);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const [searchEnabled, setSearchEnabled] = useState(true);

  const handleSave = () => {
    toast({ title: "Settings saved" });
  };

  return (
    <PageContainer variant="settings">
      <AppSectionHeader
        title="Settings"
        subtitle="Configure Help Center behavior"
      />

      <div className="space-y-6">
        {/* Public Help Center */}
        <AppCard>
          <AppCardHeader>
            <AppCardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public Help Center
            </AppCardTitle>
          </AppCardHeader>
          <AppCardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable public Help Center</Label>
                <p className="text-xs text-muted-foreground">
                  Make published articles accessible at /help
                </p>
              </div>
              <Switch 
                checked={publicHelpEnabled} 
                onCheckedChange={setPublicHelpEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable search</Label>
                <p className="text-xs text-muted-foreground">
                  Allow visitors to search articles
                </p>
              </div>
              <Switch 
                checked={searchEnabled} 
                onCheckedChange={setSearchEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable article feedback</Label>
                <p className="text-xs text-muted-foreground">
                  Show "Was this helpful?" on articles
                </p>
              </div>
              <Switch 
                checked={feedbackEnabled} 
                onCheckedChange={setFeedbackEnabled}
              />
            </div>

            {publicHelpEnabled && (
              <div className="pt-2">
                <AppButton 
                  intent="tertiary" 
                  size="sm"
                  onClick={() => window.open("/help", "_blank")}
                  iconRight={<ExternalLink className="h-3.5 w-3.5" />}
                >
                  View Public Help Center
                </AppButton>
              </div>
            )}
          </AppCardBody>
        </AppCard>

        {/* Analytics */}
        <AppCard>
          <AppCardHeader>
            <AppCardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </AppCardTitle>
          </AppCardHeader>
          <AppCardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track article views</Label>
                <p className="text-xs text-muted-foreground">
                  Record when articles are viewed
                </p>
              </div>
              <Switch 
                checked={analyticsEnabled} 
                onCheckedChange={setAnalyticsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track search queries</Label>
                <p className="text-xs text-muted-foreground">
                  Log search terms for analytics
                </p>
              </div>
              <Switch 
                checked={analyticsEnabled} 
                onCheckedChange={setAnalyticsEnabled}
              />
            </div>
            
            <p className="text-xs text-muted-foreground pt-2">
              Analytics data helps improve Help content by showing popular topics and search gaps.
            </p>
          </AppCardBody>
        </AppCard>

        {/* Permissions */}
        <AppCard>
          <AppCardHeader>
            <AppCardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Permissions
            </AppCardTitle>
          </AppCardHeader>
          <AppCardBody className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Help Workstation access is managed via platform capabilities. 
              Users with the <code className="text-xs bg-muted px-1 py-0.5 rounded">can_manage_help</code> capability 
              or Platform Administrators can access this workstation.
            </p>
            
            <div 
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                backgroundColor: 'hsl(var(--muted) / 0.3)',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <Users className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Role-based access</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Contact a Platform Administrator to grant or revoke Help access for users.
                </p>
              </div>
            </div>
          </AppCardBody>
        </AppCard>

        {/* Save Button */}
        <div className="flex justify-end">
          <AppButton intent="primary" onClick={handleSave}>
            Save Settings
          </AppButton>
        </div>
      </div>
    </PageContainer>
  );
}
