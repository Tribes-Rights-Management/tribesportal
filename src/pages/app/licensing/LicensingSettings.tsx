import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader, PanelTitle, PanelContent, DataList, DataRow } from "@/components/ui/panel";

export default function LicensingSettings() {
  const { profile, activeTenant } = useAuth();

  return (
    <div className="p-6" style={{ backgroundColor: 'var(--platform-canvas)' }}>
      <div className="max-w-[640px]">
        <PageHeader title="Configuration" description="Licensing portal configuration" />
        <div className="space-y-4">
          <Panel>
            <PanelHeader><PanelTitle>Account</PanelTitle></PanelHeader>
            <PanelContent>
              <DataList>
                <DataRow label="Email" value={profile?.email || "—"} />
                <DataRow label="Organization" value={activeTenant?.tenant_name || "—"} />
              </DataList>
            </PanelContent>
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
