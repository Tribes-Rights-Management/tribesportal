import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

export default function LicensingRequests() {
  return (
    <div className="p-6" style={{ backgroundColor: 'var(--platform-canvas)' }}>
      <div className="max-w-[960px]">
        <PageHeader title="Requests" description="Licensing request management" />
        <InstitutionalEmptyPanel title="No requests available." description="Licensing requests will appear once submitted." />
      </div>
    </div>
  );
}
