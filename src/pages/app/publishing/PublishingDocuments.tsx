import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

/**
 * PUBLISHING DOCUMENTS — INSTITUTIONAL MODE
 */
export default function PublishingDocuments() {
  return (
    <div 
      className="p-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px]">
        <PageHeader 
          title="Documents"
          description="Contracts, agreements, and related documents"
        />

        <InstitutionalEmptyPanel
          title="No documents available."
          description="Documents will appear once uploaded to your account."
        />
      </div>
    </div>
  );
}
