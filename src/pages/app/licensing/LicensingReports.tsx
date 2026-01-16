import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

export default function LicensingReports() {
  return (
    <div className="p-6" style={{ backgroundColor: 'var(--platform-canvas)' }}>
      <div className="max-w-[960px]">
        <PageHeader title="Reports" description="Usage reports and analytics" />
        <InstitutionalEmptyPanel title="No reports available." description="Reports will appear once data is processed." />
      </div>
    </div>
  );
}
