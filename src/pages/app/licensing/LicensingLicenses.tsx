import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

export default function LicensingLicenses() {
  return (
    <div className="p-6" style={{ backgroundColor: 'var(--platform-canvas)' }}>
      <div className="max-w-[960px]">
        <PageHeader title="Licenses" description="Issued licenses and terms" />
        <InstitutionalEmptyPanel title="No licenses available." description="Issued licenses will appear once processed." />
      </div>
    </div>
  );
}
