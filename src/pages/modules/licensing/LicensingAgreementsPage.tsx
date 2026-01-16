import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";
import { PageHeader } from "@/components/ui/page-header";

/**
 * LICENSING MODULE — AGREEMENTS
 * 
 * Route: /licensing/agreements
 * Permission: licensing.view
 */
export default function LicensingAgreementsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
      <PageHeader 
        title="Agreements"
        description="Active and historical licensing agreements"
      />
      
      <div className="mt-8">
        <InstitutionalEmptyPanel
          title="No agreements available"
          description="Licensing agreements will appear once executed."
        />
      </div>
    </div>
  );
}
