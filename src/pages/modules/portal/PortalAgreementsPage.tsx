import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";
import { PageHeader } from "@/components/ui/page-header";

/**
 * CLIENT PORTAL MODULE — AGREEMENTS
 * 
 * Route: /portal/agreements
 * Permission: portal.view
 */
export default function PortalAgreementsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
      <PageHeader 
        title="Agreements"
        description="Your active agreements and contracts"
      />
      
      <div className="mt-8">
        <InstitutionalEmptyPanel
          title="No agreements available"
          description="Your agreements will appear once they are established."
        />
      </div>
    </div>
  );
}
