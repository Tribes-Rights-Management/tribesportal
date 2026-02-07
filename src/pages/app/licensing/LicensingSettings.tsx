import { useAuth } from "@/contexts/AuthContext";
import { AppPageLayout } from "@/components/app-ui";
import { Panel, PanelHeader, PanelTitle, PanelContent } from "@/components/ui/panel";
import { DetailRow, DetailRowGroup } from "@/components/ui/detail-row";

export default function LicensingSettings() {
  const { profile, activeTenant } = useAuth();

  return (
    <AppPageLayout title="Configuration" maxWidth="sm">
      <div className="space-y-4">
        <Panel>
          <PanelHeader><PanelTitle>Account</PanelTitle></PanelHeader>
          <DetailRowGroup>
            <DetailRow 
              label="Email" 
              value={profile?.email} 
              copyable 
            />
            <DetailRow 
              label="Organization" 
              value={activeTenant?.tenant_name} 
            />
          </DetailRowGroup>
        </Panel>
        <Panel>
          <PanelContent>
            <p className="text-[13px]" style={{ color: 'var(--platform-text-secondary)' }}>
              Additional configuration options will be available based on account permissions.
            </p>
          </PanelContent>
        </Panel>
      </div>
    </AppPageLayout>
  );
}
