import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

export default function LicensingDocuments() {
  return (
    <div className="p-6" style={{ backgroundColor: 'var(--platform-canvas)' }}>
      <div className="max-w-[960px]">
        <PageHeader title="Documents" description="Deliverables, cue sheets, and related documents" />
        <InstitutionalEmptyPanel title="No documents available." description="Documents will appear once uploaded." />
      </div>
    </div>
  );
}
