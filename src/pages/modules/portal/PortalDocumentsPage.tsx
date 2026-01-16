import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";
import { PageHeader } from "@/components/ui/page-header";

/**
 * CLIENT PORTAL MODULE — DOCUMENTS
 * 
 * Route: /portal/documents
 * Permission: portal.view
 */
export default function PortalDocumentsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
      <PageHeader 
        title="Documents"
        description="Contracts, tax forms, and reference materials"
      />
      
      <div className="mt-8">
        <InstitutionalEmptyPanel
          title="No documents available"
          description="Documents will appear once uploaded or generated."
        />
      </div>
    </div>
  );
}
