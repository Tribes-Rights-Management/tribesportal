import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader, PanelTitle, PanelContent, DataList, DataRow } from "@/components/ui/panel";

/**
 * Licensing Settings - Institutional mode
 */
export default function LicensingSettings() {
  const { profile, activeTenant } = useAuth();

  return (
    <div className="p-6 max-w-2xl">
      <PageHeader 
        title="Settings"
        description="Licensing portal configuration"
      />

      <div className="space-y-4">
        <Panel>
          <PanelHeader>
            <PanelTitle>Account</PanelTitle>
          </PanelHeader>
          <PanelContent>
            <DataList>
              <DataRow label="Email" value={profile?.email || "—"} />
              <DataRow label="Organization" value={activeTenant?.tenant_name || "—"} />
            </DataList>
          </PanelContent>
        </Panel>

        <div className="bg-white border border-[#E8E8E8] rounded-md p-4">
          <p className="text-[13px] text-[#6B6B6B]">
            Additional configuration options will be available.
          </p>
        </div>
      </div>
    </div>
  );
}
