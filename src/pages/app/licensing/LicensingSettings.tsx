import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader, PanelTitle, PanelContent } from "@/components/ui/panel";
import { DetailRow, DetailRowGroup } from "@/components/ui/detail-row";

export default function LicensingSettings() {
  const { profile, activeTenant } = useAuth();

  return (
    <div className="p-4 sm:p-6" style={{ backgroundColor: 'var(--platform-canvas)' }}>
      <div className="max-w-[640px]">
        <PageHeader title="Configuration" description="Licensing portal configuration" />
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
      </div>
    </div>
  );
}
